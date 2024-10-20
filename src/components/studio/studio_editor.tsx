import React, { useCallback, useEffect, useRef, useState } from 'react';
import EditorTool from '../editor/editor_tool';
import {
  currentStudioInfoAtom,
  fabricCanvasAtom,
  fontStatusAtom,
  isFabricCanvasReadyAtom,
  isFirstImageAtom,
  isRightOpenAtom,
  scaleFactorAtom,
  studioImageAtom,
  textOptionsAtom,
} from '@/atoms/studioAtoms';
import { useAtom, useAtomValue } from 'jotai';
import FabricCanvas, { FabricJson } from './fabricCanvas';
import { MacScrollbar } from 'mac-scrollbar';
import devLog from '@/utils/devLog';
import debounce from 'lodash/debounce';
import Spinner from '../spinner/spinner';
import useImageUpload from '@/hooks/studio/useImageUpload';
import useErrorModal from '@/hooks/useErrorModal';
import { validateImage } from '@/utils';
import TransBG from '@/assets/images/studio/transparent.png';
import { fabric } from 'fabric';

const StudioEditor = () => {
  /** DOM */
  const bodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** 크기 */
  const [canvasSize, setCanvasSize] = useState({ width: 842, height: 428 });
  const [scaleFactor, setScalefactor] = useAtom(scaleFactorAtom);

  /** state  */
  const [fabricCanvas, setFabricCanvas] = useAtom(fabricCanvasAtom);
  const isRightOpen = useAtomValue(isRightOpenAtom);
  const [image] = useAtom(studioImageAtom);
  const [isFabricCanvasReady, setIsFabricCanvasReady] = useAtom(isFabricCanvasReadyAtom);
  const [isFirstImage, setIsFirstImage] = useAtom(isFirstImageAtom);
  const [currentStudioInfo, setCurrentStudioInfo] = useAtom(currentStudioInfoAtom);

  /** hooks */
  const { uploadImage, isLoading } = useImageUpload();
  const { showErrorModal } = useErrorModal();

  // 모든 폰트 로딩을 기다림
  useAtomValue(fontStatusAtom);

  const [isZoomEditable, setIsZoomEditable] = useState(false);
  const [isTextSelected, setIsTextSelected] = useState<boolean>(false);
  const [textOptions, setTextOptions] = useAtom(textOptionsAtom);

  const handleFile = async (file: File) => {
    try {
      await validateImage(file);
      await uploadImage(file);
    } catch (err) {
      showErrorModal(err);
    }
  };

  const changeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file);
      e.target.value = '';
    }
  };

  const changeNewImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setIsFirstImage(false);
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file);
      e.target.value = '';
    }
  };

  const dropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    devLog('파일 드랍');
    const files = e.dataTransfer.files;
    const file = files[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const setCanvas = async () => {
    // 추후에 이미지 object도 캔버스에 추가해야 할 경우, image 확인

    devLog('캔버스 초기화 시작');
    if (canvasRef.current && bodyRef && image) {
      const maxWidth = bodyRef.current?.clientWidth;
      const maxHeight = bodyRef.current?.clientHeight;
      const canvas = new FabricCanvas(canvasRef.current, image, maxWidth!, maxHeight!);
      setCanvasSize({ width: maxWidth!, height: maxHeight! });
      await canvas.setCanvasBackgroundImage();
      const scaleFactor = canvas.getCurrentScaleFactor();
      setScalefactor(scaleFactor);
      setFabricCanvas(canvas);

      setIsFabricCanvasReady(true);
      devLog('캔버스 초기화 완료');
    }
  };

  const addText = useCallback(
    (x = 10, y = 10) => {
      fabricCanvas?.addText('Text', { ...textOptions, top: y, left: x });
    },
    [fabricCanvas, textOptions],
  );

  const handleTextCursor = () => {
    const position = fabricCanvas?.getMousePosition();
    addText(position!.x!, position!.y!);
    setIsTextSelected(false);
  };

  const handleClickCanvas = () => {
    if (isTextSelected) {
      handleTextCursor();
    } else {
      const targetObject = fabricCanvas?.getActiveObject();
      if (targetObject && targetObject instanceof fabric.Textbox) {
        const {
          fontFamily,
          fontSize,
          textAlign,
          fontStyle,
          fill,
          underline,
          linethrough,
          textBackgroundColor,
          fontWeight,
        } = targetObject;

        setTextOptions({
          fontFamily,
          fontSize,
          textAlign,
          fontStyle,
          fill,
          underline,
          linethrough,
          textBackgroundColor,
          fontWeight,
        });
      }
    }
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const { value } = e.target as HTMLInputElement;
      setZoom(Number(value));
    }
  };

  const onBlur = (e: React.FocusEvent) => {
    const { value } = e.target as HTMLInputElement;
    setZoom(Number(value));
  };

  const setZoom = (value: number) => {
    let scale = value;

    if (scale > 1000) {
      scale = 1000;
    }

    if (scale < 0) {
      scale = 0;
    }

    scale /= 100;
    setScalefactor(scale);
    fabricCanvas?.setZoom(scale);

    setIsZoomEditable(false);
  };

  const resetZoom = () => {
    if (!isFabricCanvasReady) return;
    const originalScaleFactor = fabricCanvas?.getScaleFactor();
    setScalefactor(originalScaleFactor!);
    fabricCanvas?.resetZoom();
  };

  const saveTemp = useCallback(() => {
    const prevHistory = fabricCanvas?.getHistory() || [];
    let savedHistory: FabricJson[] = [];
    if (prevHistory?.length > 0) {
      savedHistory = prevHistory;
    } else {
      const canvas = fabricCanvas?.canvasToJson();
      if (canvas) {
        savedHistory.push(canvas);
      }
    }
    setIsFirstImage(true);
    setCurrentStudioInfo((prev) => ({
      ...prev,
      history: savedHistory,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas]);

  const loadTemp = useCallback(() => {
    if (isFabricCanvasReady && fabricCanvas && currentStudioInfo.history.length > 0) {
      devLog('데이터 불러오기 시작');
      fabricCanvas.loadTemp(currentStudioInfo.history);
    }
  }, [currentStudioInfo.history, fabricCanvas, isFabricCanvasReady]);

  useEffect(() => {
    (async () => {
      if (image) {
        if (isFirstImage) {
          await setCanvas();
        } else {
          await fabricCanvas?.changeBackgroundImage(image);
          const sf = fabricCanvas?.getCurrentScaleFactor() || 1;
          setScalefactor(sf);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, isFirstImage]);

  const changeCanvasSize = () => {
    const maxWidth = bodyRef.current?.clientWidth;
    const maxHeight = bodyRef.current?.clientHeight;
    fabricCanvas?.setMaxSize(maxWidth!, maxHeight!);
    setCanvasSize({ width: maxWidth!, height: maxHeight! });
  };

  useEffect(() => {
    const onResize = debounce(() => {
      changeCanvasSize();
    });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width, fabricCanvas]);

  useEffect(() => {
    // 캔버스 사이즈 재설정
    setTimeout(() => {
      changeCanvasSize();
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRightOpen, fabricCanvas, setCanvasSize]);

  useEffect(() => {
    loadTemp();
  }, [currentStudioInfo.history, isFabricCanvasReady, loadTemp]);

  /**
   * 이벤트
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        // Ctrl + Z (맥에서는 Cmd + Z) 실행 취소
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          fabricCanvas?.undo();
          return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          fabricCanvas?.deleteActiveObject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fabricCanvas]);

  useEffect(() => {
    if (isTextSelected) {
      fabricCanvas?.setCursor('text');
    } else {
      fabricCanvas?.setCursor('default');
    }
  }, [fabricCanvas, isTextSelected]);

  useEffect(() => {
    return () => {
      saveTemp();
    };
  }, [fabricCanvas, saveTemp]);

  useEffect(() => {
    return () => {
      setIsFabricCanvasReady(false);
      setFabricCanvas(null);
    };
  }, [setFabricCanvas, setIsFabricCanvasReady]);

  return (
    <MacScrollbar>
      <div className="editor_head">
        <EditorTool addText isTextSelected={isTextSelected} setIsTextSelected={setIsTextSelected} />
        <div className="editor_view">
          <div className="zome">
            <div className="zome_out hover" onClick={() => setZoom(scaleFactor * 100 - 10)}></div>
            {isZoomEditable ? (
              <div className="number">
                <input type="number" defaultValue={Math.ceil(scaleFactor * 100)} onBlur={onBlur} onKeyDown={onEnter} />
              </div>
            ) : (
              <div onDoubleClick={() => setIsZoomEditable(true)} className="zome_tx">
                {Math.ceil(scaleFactor * 100)}%
              </div>
            )}

            <div
              className="zome_in hover"
              onClick={() => {
                setZoom(scaleFactor * 100 + 10);
              }}
            ></div>
          </div>
          <div className="full" onClick={resetZoom}>
            <div className="full_screen hover"></div>
          </div>
        </div>
      </div>

      {image ? (
        <div
          ref={bodyRef}
          onDrop={(e: React.DragEvent) => e.preventDefault()}
          className="editor_body"
          style={{ backgroundImage: `url(${TransBG})` }}
        >
          {!isFabricCanvasReady && <Spinner />}

          <input
            onChange={changeNewImageInput}
            id="fileInput"
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
          />
          <label htmlFor="fileInput" className="custom-file-label">
            <div className="editor_reset"></div>
          </label>
          <div
            onClick={handleClickCanvas}
            className="container"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
            }}
          >
            <canvas ref={canvasRef}></canvas>
          </div>
        </div>
      ) : (
        <div className="editor_body">
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="select_flie" onDrop={dropFile} onDragOver={handleDragOver}>
              <div className="flie_cont">
                <div className="download">
                  Drag file to upload
                  <br />
                  or,{' '}
                  <input
                    onChange={changeInput}
                    id="fileInput"
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <label htmlFor="fileInput" className="custom-file-label">
                    <span className="select">Select file</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </MacScrollbar>
  );
};

export default StudioEditor;
