import { CopyListItem } from '@/types/studio';
import useModal from '@/hooks/useModal';

import { studioImageAtom, fabricCanvasAtom, textOptionsAtom, currentStudioInfoAtom } from '@/atoms/studioAtoms';
import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback } from 'react';
import { ValidationErrors } from '@/constants/errorMessages';

const CopyItem = ({ copyItem, openCopySave }: CopyListItem) => {
  const { alertModal } = useModal();
  const studioImage = useAtomValue(studioImageAtom);
  const fabricCanvas = useAtomValue(fabricCanvasAtom);
  const textOptions = useAtomValue(textOptionsAtom);
  const [currentStudioInfo, setCurrentStudioInfo] = useAtom(currentStudioInfoAtom);

  const save = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openCopySave(copyItem);
  };

  const addTextToCanvas = useCallback(() => {
    if (!studioImage) {
      alertModal(ValidationErrors.REQUIRED_IMAGE);
    }

    fabricCanvas?.addCopy(copyItem.text, { ...textOptions, top: 100, left: 100 });
    setCurrentStudioInfo({ ...currentStudioInfo, copy: copyItem });
  }, [alertModal, copyItem, currentStudioInfo, fabricCanvas, setCurrentStudioInfo, studioImage, textOptions]);

  return (
    <>
      <li onClick={addTextToCanvas}>
        <div className="copy_title">{copyItem.text}</div>
        <div className="copy_save">
          <button onClick={save}>Save to Library</button>
        </div>
      </li>
    </>
  );
};

export default CopyItem;
