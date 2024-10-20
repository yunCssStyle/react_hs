import LocationBox from './location_box';
import { useAtom } from 'jotai';
import { SetStateAction, useEffect, useState } from 'react';
import { folderListAtom } from '@/atoms/studioAtoms';
import CreateBtn from './create_btn';
import useStudioFolder from '@/hooks/studio/useStudioFolder';
import useStudioFile from '@/hooks/studio/useStudioFile';
import { devError } from '@/utils/devLog';
import { CopyItem } from '@/types/studio/copy';
import FolderModal from './folder_modal';
import useErrorModal from '@/hooks/useErrorModal';
interface SaveModalProps {
  title: string;
  titles: string;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  type: 'COPY' | 'FILE';
  copyItem?: CopyItem | null;
}
const SaveModal: React.FC<SaveModalProps> = ({ title, titles, setIsOpen: setIsSelfOpen, type, copyItem }) => {
  const [folderList] = useAtom(folderListAtom);
  const { saveBanner, saveCopy } = useStudioFile();
  const { fetchFolderList } = useStudioFolder();
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const { showErrorModal } = useErrorModal();

  const setAllFolder = async () => {
    try {
      await fetchFolderList();
    } catch (err) {
      devError(err);
    }
  };

  useEffect(() => {
    setAllFolder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickSave = async () => {
    try {
      if (type === 'FILE') {
        await saveBanner();
      } else if (type === 'COPY') {
        if (!copyItem) {
          throw new Error('선택된 카피가 없습니다');
        }
        await saveCopy(copyItem);
      }
      setIsSelfOpen(false);
    } catch (err) {
      showErrorModal(err);
    }
  };

  return (
    <>
      <div className="modal open" onClick={() => setIsSelfOpen(false)}>
        <div className="alert" onClick={(e) => e.stopPropagation()}>
          <span className="iconClose" onClick={() => setIsSelfOpen(false)}>
            X
          </span>
          <div className="save_modal modal_box">
            <div className="title">{title}</div>
            <div className="titles">{titles}</div>
            <LocationBox isDirectoryOpen={isDirectoryOpen} setIsDirectoryOpen={setIsDirectoryOpen} />
            <CreateBtn />
            <div className="modal_btns">
              <button className="cancel" onClick={() => setIsSelfOpen(false)}>
                Cancel
              </button>
              <button className="Save" disabled={folderList.length < 1} onClick={handleClickSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      {isDirectoryOpen ? (
        <FolderModal folderList={folderList} setIsOpen={setIsDirectoryOpen} callback={handleClickSave} />
      ) : null}
    </>
  );
};

export default SaveModal;
