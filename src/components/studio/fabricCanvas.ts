/**
 * 이 클래스에서의 'history'는 아카이브에 저장되는 작업내역이 아닌
 * 실행 취소를 위한 내부적인 history임...
 */

import { ValidationErrors } from '@/constants/errorMessages';
import { convertImageToBase64 } from '@/utils';
import devLog from '@/utils/devLog';
import { fabric } from 'fabric';

export type TextOptions = Pick<
  fabric.ITextboxOptions,
  | 'fontFamily'
  | 'fill'
  | 'fontSize'
  | 'fontStyle'
  | 'fontWeight'
  | 'textAlign'
  | 'underline'
  | 'linethrough'
  | 'textBackgroundColor'
  | 'left'
  | 'top'
  | 'scaleX'
  | 'scaleY'
  | 'text'
>;

type FabricBackgroundImage = any; // 라이브러리에 type이 없어서 any 사용

interface CustomTextBox extends TextOptions {
  source?: 'USER' | 'COPY';
}
export interface FabricJson {
  version: string;
  objects: fabric.Object[];
  backgroundImage: FabricBackgroundImage;
}

class FabricCanvas {
  private canvas: fabric.Canvas | undefined = undefined;
  private history: FabricJson[] = [];
  private currentIndex = -1;
  private isHistoryLocked = false;

  // 캔버스 크기 관련
  private maxWidth: number;
  private maxHeight: number;
  public canvasSize = { width: 0, height: 0 };
  private scaleFactor = 1;
  private currentScaleFactor = 1;

  // 배경 이미지 관련
  private originalImgSize = { width: 0, height: 0 };
  private backgroundImage: string | null = null;

  // 마우스
  private mousePosition = { x: 0, y: 0 };

  // 드래그
  private panning = false;

  // 텍스트
  public textOptions: TextOptions = {};

  constructor(targetElement: HTMLCanvasElement, imageDataUrl: string, maxWidth: number, maxHeight: number) {
    this.backgroundImage = imageDataUrl;

    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    fabric.Textbox.prototype.insertNewStyleBlock = function () {};
    fabric.Object.prototype.borderColor = '#5771FF';
    fabric.Object.prototype.cornerColor = '#fff';
    fabric.Object.prototype.cornerStrokeColor = '#5771FF';
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerSize = 8;
    fabric.Textbox.prototype.setControlsVisibility({
      mt: false,
      mb: false,
    });

    this.canvas = new fabric.Canvas(targetElement, {
      fireRightClick: true,
      fireMiddleClick: true,
      stopContextMenu: true,
    });

    this.saveHistory = this.saveHistory.bind(this);

    // fabric.js의 이벤트를 추가함
    // 이벤트 종류 - http://fabricjs.com/events
    this.canvas.on('object:modified', this.saveHistory);
    this.canvas.on('object:added', this.saveHistory);
    this.canvas.on('object:removed', this.saveHistory);
    this.canvas.on('mouse:down', this.handleMouseDown);
    this.canvas.on('mouse:down', (event: fabric.IEvent<MouseEvent>) => {
      if (event.button !== 1) {
        const target = this.canvas!.getActiveObject();
        // 뷰포트보다 이미지 영역 클 때만 panning 활성화

        if (!target && this.scaleFactor < this.currentScaleFactor) {
          this.panning = true;
          this.canvas!.setCursor('grabbing');
        }
      }
    });
    this.canvas.on('mouse:move', (event: fabric.IEvent<MouseEvent>) => {
      if (this.panning && event.e && this.scaleFactor < this.currentScaleFactor) {
        const delta = new fabric.Point(event.e.movementX, event.e.movementY);
        this.canvas!.relativePan(delta);
        this.canvas!.setCursor('grabbing');
      }
    });

    this.canvas.on('mouse:up', (event: fabric.IEvent<MouseEvent>) => {
      if (event.button !== 1) {
        this.panning = false;
        this.canvas!.setCursor('grab');
      }
    });

    this.canvas.on('object:modified', (e: fabric.IEvent) => {
      const obj = e.target;

      if (obj && obj.type === 'textbox') {
        const textbox = obj as fabric.Textbox;
        const scaleX = textbox.scaleX!;
        const scaleY = textbox.scaleY!;

        textbox.fontSize! *= Math.sqrt(scaleX * scaleY);
        textbox.width! *= scaleX;
        textbox.height! *= scaleY;

        textbox.scaleX = 1;
        textbox.scaleY = 1;

        textbox.setCoords();
      }
    });
  }

  /**
   * getter
   */

  public getScaleFactor() {
    return this.scaleFactor;
  }

  public getCurrentScaleFactor() {
    return this.currentScaleFactor;
  }

  public getHistory() {
    return this.history;
  }

  public getMousePosition() {
    return this.mousePosition;
  }

  public getActiveObject() {
    return this.canvas?.getActiveObject();
  }

  async loadTemp(history: FabricJson[]) {
    this.history = history;
    this.lockHistory();
    this.canvas?.clear();
    await this.applyHistory(history[history.length - 1], this.backgroundImage || '');
    this.history = [];
    this.unlockHistory();
  }

  // 캔버스 초기화
  public resetCanvas() {
    this.canvas?.clear();
    this.history = [];
  }

  // 캔버스 제거
  public dispose() {
    this.canvas?.dispose();
    this.canvas = undefined;
  }

  // 뷰포트 변경
  public setMaxSize(maxWidth: number, maxHeight: number) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.canvasSize.width = maxWidth;
    this.canvasSize.height = maxHeight;
  }

  // 히스토리 잠그기
  public lockHistory = () => {
    this.isHistoryLocked = true;
  };

  // 히스토리 잠금 해제
  public unlockHistory = () => {
    this.isHistoryLocked = false;
  };

  // 배경 이미지 추가
  public setCanvasBackgroundImage = async (): Promise<void> => {
    if (!this.backgroundImage) return;
    const imagebase64 = await convertImageToBase64(this.backgroundImage);

    return new Promise((resolve, reject) => {
      if (!this.backgroundImage) {
        reject(new Error(ValidationErrors.REQUIRED_IMAGE));
        return;
      }

      if (!imagebase64) {
        reject(new Error('이미지 변환에 실패했습니다'));
      }

      fabric.Image.fromURL(imagebase64 as string, (img) => {
        // 이미지의 원래 사이즈
        this.originalImgSize.width = img.width!;
        this.originalImgSize.height = img.height!;

        img.set({
          selectable: false,
        });

        this.canvasSize.width = this.originalImgSize.width < this.maxWidth ? this.maxWidth : this.originalImgSize.width;
        this.canvasSize.height =
          this.originalImgSize.height < this.maxHeight ? this.maxHeight : this.originalImgSize.height;

        this.canvas?.setWidth(this.canvasSize.width);
        this.canvas?.setHeight(this.canvasSize.height);
        this.canvas?.add(img);
        img.sendToBack();

        this.canvas?.renderAll();

        const widthRatio = this.maxWidth / this.originalImgSize.width;
        const heightRatio = this.maxHeight / this.originalImgSize.height;

        this.scaleFactor = Math.min(widthRatio, heightRatio);

        // 원본 이미지 크기가 캔버스 크기와 같거나 작으면 확대 하지 않고 원본 사이즈
        if (this.scaleFactor >= 1) {
          this.setZoom(1);
          this.currentScaleFactor = 1;
        } else {
          this.resetZoom();
          this.currentScaleFactor = this.scaleFactor;
        }

        resolve();
      });
    });
  };

  // 배경 이미지 변경
  public async changeBackgroundImage(image: string) {
    this.backgroundImage = image;
    const objects = this.canvas?.getObjects();

    // 객체를 순회하면서 배경 이미지인지 확인하고 제거하기
    objects?.forEach((obj) => {
      if (obj.type === 'image') {
        this.canvas?.remove(obj); // 배경 이미지인 경우 제거
      }
    });

    await this.setCanvasBackgroundImage();
    this.history = [];
  }

  public centerCanvas(scaleFactor: number) {
    if (!this.canvas) return;

    devLog('캔버스 사이즈', this.canvasSize.width);

    const x = this.maxWidth / 2 - (this.originalImgSize.width * scaleFactor) / 2;
    const y = this.maxHeight / 2 - (this.originalImgSize.height * scaleFactor) / 2;

    this.canvas?.absolutePan(new fabric.Point(-x, -y));
  }

  public setZoom(currentScaleFactor: number) {
    if (currentScaleFactor > 10 || currentScaleFactor < 0) {
      // 0배부터 10배까지
      throw new Error('0부터 10까지 값만 입력 가능');
    }

    this.currentScaleFactor = currentScaleFactor;

    this.canvas?.setZoom(currentScaleFactor);
    this.centerCanvas(currentScaleFactor);
  }

  public resetZoom() {
    // 초기의 맞춤 비율로 수정
    this.canvas?.setZoom(this.scaleFactor);
    this.centerCanvas(this.scaleFactor);
  }

  public getViewportSize = () => {
    return {
      width: this.originalImgSize.width * this.scaleFactor,
      height: this.originalImgSize.height * this.scaleFactor,
    };
  };

  // 텍스트 추가
  public addText(text: string, textOptions?: TextOptions, source: 'COPY' | 'USER' = 'USER') {
    const fabricText = new fabric.Textbox(text, {
      ...(textOptions ? textOptions : this.textOptions),
      editable: true,
      dirty: true,
      borderColor: '#5771FF',
      cornerColor: '#fff',
      cornerStrokeColor: '#5771FF',
      transparentCorners: false,
      cornerSize: 8,
      source,
      // scaleX: 1 / this.scaleFactor,
      // scaleY: 1 / this.scaleFactor, 뷰포트 기준으로 폰트 크기 설정하려면 주석 해제
    } as CustomTextBox);

    fabricText.setControlsVisibility({
      mt: false, // 중앙 상단 컨트롤 숨김
      mb: false, // 중앙 하단 컨트롤 숨김
    });

    this.canvas?.add(fabricText);

    this.canvas?.setActiveObject(fabricText);
  }

  // 카피 추가
  // public addCopy(text: string, textOptions?: TextOptions) {
  //   const copyObjects: fabric.Textbox[] = [];

  //   this.canvas?.forEachObject((obj) => {
  //     if (obj.type === 'textbox' && (obj as unknown as CustomTextBox)?.source === 'COPY') {
  //       copyObjects.push(obj as fabric.Textbox);
  //     }
  //   });

  //   if (copyObjects.length > 0) {
  //     copyObjects.forEach((textbox) => {
  //       textbox.text = text;
  //       textbox.setCoords();
  //       this.canvas?.renderAll();
  //     });
  //   } else {
  //     this.addText(text, textOptions, 'COPY');
  //   }
  // }

  public addCopy(text: string, textOptions?: TextOptions) {
    const target = this.canvas?.getActiveObject();
    if (target) {
      this.changeSelectedTextOptions({ text });
    } else {
      this.addText(text, textOptions, 'COPY');
    }
  }

  // 마우스 좌표
  private setMousePosition = (e: fabric.IEvent<MouseEvent>) => {
    this.mousePosition = e.absolutePointer || { x: 0, y: 0 };
    devLog('x: ' + this.mousePosition.x + ' y: ' + this.mousePosition.y);
  };

  private handleMouseDown = (e: fabric.IEvent<MouseEvent>) => {
    this.setMousePosition(e);
  };

  public deleteActiveObject() {
    const activeObjects = this.canvas?.getActiveObjects();

    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((object) => {
        this.canvas?.remove(object);
      });

      this.canvas?.discardActiveObject(); // 선택 해제
      this.canvas?.renderAll();
    }
  }

  public canvasToJson(excludeImage = false) {
    const newJson: FabricJson = this.canvas?.toJSON([
      'selectable',
      'evented',
      'left',
      'top',
      'scaleX',
      'scaleY',
      'borderColor',
      'cornerColor',
      'cornerStrokeColor',
      'transparentCorners',
      'cornerSize',
      'source',
    ]) as FabricJson; // 명시적으로 포함해야 하는 항목

    if (excludeImage) {
      newJson.objects = newJson.objects.filter((obj) => obj.type !== 'image');
    }

    return newJson;
  }

  // 히스토리 저장
  private saveHistory() {
    if (this.isHistoryLocked) {
      return;
    }

    devLog('히스토리 저장', this.history.length + 1);
    const newJson: FabricJson = this.canvasToJson();
    this.history.push(newJson);
    this.currentIndex = this.history.length - 1;
  }

  // json 을 캔버스에 적용
  public applyFabricJsonToCanvas = (fabricJson: FabricJson, callback?: () => any): Promise<void> => {
    return new Promise((resolve) => {
      this.canvas?.loadFromJSON(fabricJson, () => {
        this.canvas?.renderAll();
        if (callback) callback();
        resolve();
      });
    });
  };

  // 저장된 작업이력을 불러와서 캔버스에 적용
  public applyHistory(fabricJson: FabricJson, imgUrl?: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!fabricJson) {
        reject(new Error('Json 데이터가 없습니다'));
        return;
      }

      this.lockHistory();
      this.canvas?.clear();

      this.applyFabricJsonToCanvas(fabricJson, () => {
        if (imgUrl) {
          devLog('배경 이미지 설정', imgUrl);
          this.backgroundImage = imgUrl;
          this.setCanvasBackgroundImage()
            .then(() => {
              this.unlockHistory();
              this.saveHistory();
              resolve();
            })
            .catch((error) => {
              this.unlockHistory();
              reject(error);
            });
        }
      });
    });
  }

  // 실행 취소
  public undo() {
    if (this.currentIndex <= 0 || this.history.length < 1) {
      return;
    }

    // 하나 이전 값으로 변경
    const prevState = this.history[this.currentIndex - 1];
    this.currentIndex = this.currentIndex - 1;
    this.lockHistory();
    this.applyFabricJsonToCanvas(prevState, this.unlockHistory);
  }

  // 선택된 텍스트 박스 오브젝트의 옵션 변경
  public changeSelectedTextOptions(options: TextOptions) {
    const activeObject = this.canvas?.getActiveObject();
    if (activeObject && activeObject instanceof fabric.Textbox) {
      activeObject.exitEditing();
      activeObject.set(options);
      this.canvas?.renderAll();
      this.saveHistory();
    }
  }

  public setCursor(cursor: string) {
    if (this.canvas) {
      this.canvas.hoverCursor = cursor;
    }
  }

  public getImage(format: 'jpg' | 'png' = 'jpg', quality = 1): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.canvas) {
        reject('캔버스가 존재하지 않음');
        return;
      }

      const tempCanvas = new fabric.Canvas(null);

      tempCanvas.setWidth(this.canvasSize.width);
      tempCanvas.setHeight(this.canvasSize.height);

      const jsonData = this.canvas.toJSON();

      tempCanvas.loadFromJSON(jsonData, () => {
        tempCanvas.forEachObject(
          (
            obj: fabric.Object & {
              left?: number;
              top?: number;
              scaleX?: number;
              scaleY?: number;
            },
          ) => {
            obj.setCoords();
          },
        );

        tempCanvas.setWidth(this.originalImgSize.width);
        tempCanvas.setHeight(this.originalImgSize.height);

        const url = tempCanvas.toDataURL({
          format,
          quality,
        });

        resolve(url);
      });
    });
  }
}

export default FabricCanvas;
