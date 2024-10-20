import { deleteHistory as deleteHistoryAjax } from '@/api/studio';
import {
  currentStudioInfoAtom,
  fabricCanvasAtom,
  isFirstImageAtom,
  isGeneratedCopyAtom,
  scaleFactorAtom,
  studioImageAtom,
} from '@/atoms/studioAtoms';
import { userActionPrompt } from '@/constants/infoMessage';
import useStudioHistory from '@/hooks/studio/useStudioHistory';
import useErrorModal from '@/hooks/useErrorModal';
import useModal from '@/hooks/useModal';
import { HistoryItemProps } from '@/types/studio';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';

const HistoryItem: React.FC<HistoryItemProps> = ({
  created_at,
  image_url,
  prompts,
  image_data,
  org_image_url,
  copy_text,
  id,
}: HistoryItemProps) => {
  const fabricCanvas = useAtomValue(fabricCanvasAtom);
  const setStudioImage = useSetAtom(studioImageAtom);
  const [currentStudioInfo] = useAtom(currentStudioInfoAtom);
  const { fetchHistoryList } = useStudioHistory();
  const { showErrorModal } = useErrorModal();
  const { alertModal } = useModal();
  const setIsFirstImage = useSetAtom(isFirstImageAtom);

  const setScaleFactor = useSetAtom(scaleFactorAtom);
  const setIsGeneratedCopy = useSetAtom(isGeneratedCopyAtom);

  const changeHistory = async () => {
    if (fabricCanvas) {
      setIsFirstImage(false);
      const fabricJson = JSON.parse(image_data);
      setStudioImage(org_image_url);
      await fabricCanvas.applyHistory(fabricJson, org_image_url);
      setScaleFactor(fabricCanvas.getCurrentScaleFactor());
      setIsGeneratedCopy(true);
    }
  };

  const handleHistoryButtonClick = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    alertModal(userActionPrompt.IMPORT_STUDIO, changeHistory, true);
  };

  const deleteHistory = async () => {
    try {
      await deleteHistoryAjax({
        studio_id: currentStudioInfo.studioId,
        history_id: id,
      });
      fetchHistoryList();
    } catch (err) {
      showErrorModal(err);
    }
  };

  const handleDeleteButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    alertModal(userActionPrompt.DELETE_HISTORY, deleteHistory, true);
  };
  return (
    <li onClick={handleHistoryButtonClick}>
      <button onClick={handleDeleteButtonClick} className="del_btn"></button>
      <div className="history_date">{created_at}</div>
      <div className="history_content">
        <div className="img" style={{ backgroundImage: `url(${image_url})` }}></div>
        <div className="tx">{copy_text}</div>
      </div>
      <div className="tag">
        {prompts.map((prompt, index) => (
          <span key={index}>{prompt.name}</span>
        ))}
      </div>
    </li>
  );
};

export default HistoryItem;
