import StudioEditor from '@/components/studio/studio_editor';
import Right from '@/components/studio/right';
import { MacScrollbar } from 'mac-scrollbar';
import { useCallback, useEffect, useState } from 'react';
import Settings from '@/components/studio/settings';
import useModal from '@/hooks/useModal';
import useStudioFile from '@/hooks/studio/useStudioFile';
import {
  resetCanvasAtom,
  fabricCanvasAtom,
  isRightOpenAtom,
  currentStudioInfoAtom,
  studioImageAtom,
} from '@/atoms/studioAtoms';
import { useAtom, useAtomValue } from 'jotai';
import useErrorModal from '@/hooks/useErrorModal';
import SaveModal from '@/components/studio/SaveModal/save_modal';
import { CopyItem } from '@/types/studio/copy';
import { ValidationErrors } from '@/constants/errorMessages';
import devLog from '@/utils/devLog';
import { userActionPrompt } from '@/constants/infoMessage';

const Studio = () => {
  const [, reset] = useAtom(resetCanvasAtom);
  const fabricCanvas = useAtomValue(fabricCanvasAtom);

  const [isRightOpen, setIsRightOpen] = useAtom(isRightOpenAtom);
  const { alertModal } = useModal();
  const { showErrorModal } = useErrorModal();

  // 세이브 모달
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [saveType, setSaveType] = useState<'FILE' | 'COPY'>('FILE');
  const [selectedCopyItem, setSelectedCopyItem] = useState<CopyItem | null>(null);

  // 스튜디오 정보
  const [currentStudioInfo] = useAtom(currentStudioInfoAtom);
  // 이미지
  const studioImage = useAtomValue(studioImageAtom);

  // 임시 저장
  const { saveDraft } = useStudioFile();

  const toggleRightPanel = () => {
    setIsRightOpen(!isRightOpen);
  };

  const resetConfirm = () => {
    reset();
  };

  const exportImage = useCallback(async () => {
    let dataUrl;
    try {
      if (!studioImage || !fabricCanvas) throw new Error(ValidationErrors.REQUIRED_IMAGE);
      dataUrl = await fabricCanvas?.getImage();
      if (!dataUrl) throw new Error('이미지 저장 실패');
      const link = document.createElement('a');
      link.href = dataUrl;

      link.download = currentStudioInfo.filename || 'download-image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showErrorModal(err);
    }
  }, [fabricCanvas, showErrorModal, currentStudioInfo, studioImage]);

  const openFileSave = () => {
    setSaveType('FILE');
    setIsSaveOpen(true);
  };

  const openCopySave = (copyItem: CopyItem) => {
    setSelectedCopyItem(copyItem);
    setSaveType('COPY');
    setIsSaveOpen(true);
  };

  // draft 자동 저장

  useEffect(() => {
    let draftInterval: NodeJS.Timeout;
    if (currentStudioInfo.studioId) {
      draftInterval = setInterval(
        () => {
          devLog('-----Draft 생성');
          saveDraft();
        },
        1000 * 60 * 5,
      );
    }
    return () => {
      clearInterval(draftInterval);
    };
  }, [currentStudioInfo.studioId, saveDraft]);

  return (
    <div className="studio_cont">
      <MacScrollbar className="left_menu studio_left">
        <Settings />
      </MacScrollbar>
      <div className={`editor_cont  ${isRightOpen ? 'open' : ''}`}>
        <StudioEditor />
      </div>
      <div className={`right ${isRightOpen ? 'open' : ''}`}>
        <Right openCopySave={openCopySave} toggleRightPanel={toggleRightPanel} />
      </div>
      <div className="bottom">
        <div className="reset_btn" onClick={() => alertModal(userActionPrompt.RESET_STUDIO, resetConfirm, true)}>
          Reset
        </div>
        <div className="btns">
          <button className="btn save_btn" onClick={openFileSave}>
            Save to Library
          </button>
          <button className="btn publish_btn" onClick={() => exportImage()}>
            Export
          </button>
        </div>
      </div>
      {isSaveOpen ? (
        <SaveModal
          type={saveType}
          setIsOpen={setIsSaveOpen}
          copyItem={selectedCopyItem}
          title="라이브러리에 저장하시겠습니까?"
          titles="새로운 폴더를 생성 또는 원하는 경로를 설정 후 저장해주세요."
        />
      ) : null}
    </div>
  );
};

export default Studio;
