import LocationBox from './location_box';
import { SaveModalProps } from '@/types/modal';
import useModal from '@/hooks/useModal';
import { useEffect } from 'react';
import CreateBtn from './create_btn';
import { useAtom, useAtomValue } from 'jotai';
import { foldersWithStorageAtom, selectedFolderLocationAtom } from '@/atoms/folderAtoms';

const SaveModal = ({ title, titles, Callback, create, callbackType }: SaveModalProps) => {
  const { closeModal } = useModal();

  const [, setSelectedFolderLocation] = useAtom(selectedFolderLocationAtom);
  const folderList = useAtomValue(foldersWithStorageAtom);

  // 폴더 리스트 가져오기
  const setFirstFolderOnSelect = () => {
    if (folderList && folderList.length > 0) {
      setSelectedFolderLocation(folderList[0]);
    }
  };

  // MOUNTED
  useEffect(() => {
    setFirstFolderOnSelect();
    return () => {
      setSelectedFolderLocation(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="save_modal modal_box">
        <div className="title">{title}</div>
        <div className="titles">{titles}</div>
        {/* 위치 : */}
        <LocationBox isFolder={false} Callback={Callback} />

        {/* MOVE 클릭 => Create Folder 버튼 */}
        {create && <CreateBtn Callback={() => Callback!('folder')} />}

        <div className="modal_btns">
          <button className="cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            disabled={!folderList || folderList?.length < 1}
            className="Save"
            onClick={() => Callback!(callbackType)}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default SaveModal;
