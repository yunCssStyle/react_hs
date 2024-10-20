import { NewFolderProps } from '@/types/modal';
import useModal from '@/hooks/useModal';
import { useState } from 'react';
import { changeArchiveFolerName, createArchiveFolder } from '@/api/archive/archive';
import { ChangeFolderNameRequestType, CreateFolderRequestType, Folder } from '@/types/archive/archive';
import devLog from '@/utils/devLog';
import { selectedFolderLocationAtom, untitledFolderCount } from '@/atoms/folderAtoms';
import { useAtom, useAtomValue } from 'jotai';
// import { selectedFolderAtom } from '@/atoms/studioAtoms';

const NewFolder = ({ folderData, folderID, name, title, callbackType, Callback }: NewFolderProps) => {
  const { closeAlertModal } = useModal();
  const [folderName, setFolderName] = useState(name ? name : folderData ? folderData.name : '');

  const selectedFolderLocation = useAtomValue(selectedFolderLocationAtom);
  const [untitledFolders, setUntitledFolders] = useAtom(untitledFolderCount);
  // const sidebarSelectedFolder = useAtomValue(selectedFolderAtom);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
  };

  const handleSaveClick = () => {
    switch (title) {
      case '새로운 폴더':
        devLog('새로운 폴더 클릭');
        handleAddFolder();
        break;
      case '이름 변경':
        devLog('이름 변경 클릭');
        handleEditFolderName();
        break;
    }
    Callback(callbackType);
  };

  // 폴더 생성
  const handleAddFolder = async () => {
    const SELECTED_FOLDER = JSON.parse(localStorage.getItem('selectedFolder') as string) as Folder;

    const params: CreateFolderRequestType = {
      folder_name: folderName ? folderName : `Untitled Folder${untitledFolders ? `(${untitledFolders})` : ''}`,
      parent_id: selectedFolderLocation?.id
        ? selectedFolderLocation?.id
        : SELECTED_FOLDER
        ? SELECTED_FOLDER.id
        : undefined,
    };

    await createArchiveFolder(params).then(() => {
      setUntitledFolders((prev) => {
        if (prev !== null) {
          return prev + 1;
        }
        return prev;
      });

      Callback();
    });
  };

  // 폴더 이름 변경
  const handleEditFolderName = async () => {
    const params: ChangeFolderNameRequestType = {
      id: folderID ? folderID : (folderData?.id as string),
      name: folderName,
    };

    await changeArchiveFolerName(params).then(() => {
      Callback();
    });
  };

  return (
    <>
      <div className="new_folder modal_box">
        <div className="title small text_left">{title}</div>
        <div className="folder">
          <div className="ti">이름:</div>
          <div>
            <input
              type="text"
              id="ID"
              placeholder={folderData ? folderData.name : 'Untitled Folder'}
              value={folderName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="modal_btns">
          <button className="cancel" onClick={closeAlertModal}>
            Cancel
          </button>
          <button className="Save" onClick={handleSaveClick}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default NewFolder;
