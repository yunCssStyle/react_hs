import { getBannerDetail } from '@/api/archive/archive';
import {
  copyListAtom,
  currentStudioInfoAtom,
  fabricCanvasAtom,
  folderListAtom,
  isGeneratedCopyAtom,
  selectedFolderAtom,
  studioImageAtom,
} from '@/atoms/studioAtoms';
import { RoutePaths } from '@/routes/RoutePaths';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudioHistory from './useStudioHistory';
import { convertBase64ToBlob, sliceString } from '@/utils';
import { saveBannerAndHistory, saveCopy as saveCopyAjax } from '@/api/studio';
import { createDraft } from '@/api/archive/archive';
import useModal from '@/hooks/useModal';
import useStudioFolder from './useStudioFolder';
import { CopyItem } from '@/types/studio/copy';
import { ValidationErrors } from '@/constants/errorMessages';
import { infoMessage } from '@/constants/infoMessage';
import { getDraftDetail } from '@/api/draft/draft';
import { DraftDetailResponseType } from '@/types/draft/draft';
import { BannerDetailResponseType } from '@/types/archive/archive';

const useStudioFile = () => {
  const navigate = useNavigate();
  const setCurrentStudioInfo = useSetAtom(currentStudioInfoAtom);
  const [studioImage, setStudioImage] = useAtom(studioImageAtom);
  const setCopyListAtom = useSetAtom(copyListAtom);
  const { fetchHistoryList } = useStudioHistory();
  const fabricCanvas = useAtomValue(fabricCanvasAtom);
  const [currentStudioInfo] = useAtom(currentStudioInfoAtom);
  const [selectedFolder, setSelectedFolder] = useAtom(selectedFolderAtom);
  const folderList = useAtomValue(folderListAtom);
  const setIsGeneratedCopy = useSetAtom(isGeneratedCopyAtom);
  const { alertModal } = useModal();
  const { fetchFolderList } = useStudioFolder();
  const [isLoading, setIsLoading] = useState(false);

  const initFolder = async () => {
    await fetchFolderList();
    setSelectedFolder(folderList[0]);
  };

  const handleFile = (data: DraftDetailResponseType | BannerDetailResponseType, disableSettings = false) => {
    const {
      copy_id,
      filename,
      studio_id: studioId,
      description: detail,
      copies,
      prompts,
      org_img_url: imageUrl,
      org_img_id: imageId,
      img_data: fabricJsonString,
      copy_pid,
      copy_text,
      attribute,
      temperature,
      keywords,
    } = data;

    setStudioImage(imageUrl);
    const fabricJson = JSON.parse(fabricJsonString);

    setCurrentStudioInfo({
      studioId,
      filename,
      detail,
      copy: {
        id: copy_id,
        text: copy_text,
      },
      prompts: prompts.map((prompt) => ({ id: prompt.id, type: prompt.type, name: prompt.name })),
      copyCount: 0,
      imageId,
      history: [fabricJson],
      resetFn: null,
      copyPId: copy_pid,
      attribute,
      keywords: Array.isArray(keywords) ? keywords.filter((keyword) => keyword.trim() !== '') : [],
      temperature,
    });

    fetchHistoryList(studioId);
    setCopyListAtom(copies);
    // true 면 왼쪽 settings 비활성화
    setIsGeneratedCopy(disableSettings);
    navigate(RoutePaths.Studio);
  };

  const draftOpenFile = async (studio_id: string, draft_id: string) => {
    setIsLoading(true);

    try {
      const params = { studio_id, draft_id };
      const { data } = await getDraftDetail(params);
      handleFile(data, true);
    } finally {
      setIsLoading(false);
    }
  };

  const openFile = async (id: string) => {
    setIsLoading(true);

    try {
      const { data } = await getBannerDetail({ id });
      handleFile(data);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCopy = async (copyItem: CopyItem) => {
    const folderId = selectedFolder?.id;

    if (!folderId) {
      throw new Error(ValidationErrors.REQUIRED_FOLDER_ID);
    }

    if (!currentStudioInfo.copyPId) {
      throw new Error(ValidationErrors.REQUIRED_COPY_ID);
    }

    try {
      await saveCopyAjax({
        id: copyItem.id,
        text: copyItem.text,
        folder_id: folderId,
        prompts: currentStudioInfo.prompts,
        copy_pid: currentStudioInfo.copyPId,
      });
      alertModal(infoMessage.SAVE_LIBRARY);
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const { code } = err;
        if (code === 1202) {
          await initFolder();
        }
      }
      throw err;
    }
  };

  const saveBanner = async () => {
    const exportedJSON = fabricCanvas?.canvasToJson(true);

    try {
      if (!exportedJSON) {
        throw new Error(ValidationErrors.REQUIRED_FABRIC_JSON);
      }
      const jsonString = JSON.stringify(exportedJSON);
      const studioId = currentStudioInfo.studioId;
      const folderId = selectedFolder?.id;
      const detail = currentStudioInfo.detail;
      const filename = currentStudioInfo.filename;
      const prompts = currentStudioInfo.prompts;
      const imageId = currentStudioInfo.imageId;
      const copyId = currentStudioInfo.copy?.id;
      const copyPId = currentStudioInfo.copyPId;

      if (!studioId) {
        throw new Error(ValidationErrors.REQUIRED_STUDIO_ID);
      }

      if (!imageId) {
        throw new Error(ValidationErrors.REQUIRED_IMAGE);
      }

      if (!folderId) {
        throw new Error(ValidationErrors.REQUIRED_FOLDER_ID);
      }

      if (!prompts) {
        throw new Error(ValidationErrors.REQUIRED_PROMPTS);
      }

      if (!folderId || !detail || !filename || !prompts || !jsonString) {
        throw new Error(ValidationErrors.REQUIRED_UNKNOWN);
      }

      const dataUrl = await fabricCanvas?.getImage();

      if (!dataUrl) {
        throw new Error(ValidationErrors.REQUIRED_DATA_URL);
      }

      const file = convertBase64ToBlob(dataUrl);

      await saveBannerAndHistory({
        studio_id: studioId,
        folder_id: folderId,
        image_id: imageId,
        filename,
        detail,
        image_data: jsonString,
        file,
        copy_id: copyId || '',
        copy_pid: copyPId || '',
      });

      alertModal(
        <p>
          <strong>“{sliceString(filename)}”</strong>
          <br /> {infoMessage.SAVE_SUCCESS}
        </p>,
      );

      fetchHistoryList();
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const { code } = err;
        if (code === 1202) {
          await initFolder();
        }
      }
      throw err;
    }
  };

  const saveDraft = async () => {
    const exportedJSON = fabricCanvas?.canvasToJson(true);
    const studioId = currentStudioInfo.studioId;
    const detail = currentStudioInfo.detail;
    const filename = currentStudioInfo.filename;
    const prompts = currentStudioInfo.prompts;
    const imageId = currentStudioInfo.imageId;
    const copyPId = currentStudioInfo.copyPId;
    const copyCount = currentStudioInfo.copyCount;
    const originImageUrl = studioImage;

    if (!originImageUrl || !exportedJSON) {
      return;
    }

    const dataUrl = await fabricCanvas?.getImage();

    if (!dataUrl) {
      throw new Error(ValidationErrors.REQUIRED_DATA_URL);
    }

    const jsonString = JSON.stringify(exportedJSON);

    // 이미지를 업로드
    await createDraft({
      filename,
      detail,
      studio_id: studioId,
      copy_pid: copyPId,
      create_copy_count: copyCount,
      origin_img_id: imageId,
      origin_img_url: originImageUrl,
      json_data: jsonString,
      prompts: prompts,
      img_url: '',
    });
  };

  return { openFile, draftOpenFile, isLoading, saveBanner, saveCopy, saveDraft };
};
export default useStudioFile;
