import { uploadBannerImage } from '@/api/studio';
import { currentStudioInfoAtom, studioImageAtom } from '@/atoms/studioAtoms';
import { useAtom } from 'jotai';
import { useState } from 'react';
const useImageUpload = () => {
  const [, setStudioImage] = useAtom(studioImageAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStudioInfo, setCurrentStudioInfo] = useAtom(currentStudioInfoAtom);

  const uploadImage = async (imageFile: File) => {
    setIsLoading(true);
    try {
      const { data } = await uploadBannerImage({
        file: imageFile,
        ...(currentStudioInfo.studioId ? { studioId: currentStudioInfo.studioId } : {}),
      });
      setStudioImage(data.image_url);
      setCurrentStudioInfo({ ...currentStudioInfo, imageId: data.image_id });
      return data.image_url;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadImage, isLoading };
};

export default useImageUpload;
