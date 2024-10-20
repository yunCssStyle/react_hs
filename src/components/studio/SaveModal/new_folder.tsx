import { createArchiveFolder } from '@/api/archive/archive';
import { selectedFolderAtom } from '@/atoms/studioAtoms';
import { infoMessage } from '@/constants/infoMessage';
import useStudioFolder from '@/hooks/studio/useStudioFolder';
import useModal from '@/hooks/useModal';
import { CreateFolderRequestType, Folder } from '@/types/archive/archive';
import { sliceString } from '@/utils';
import { useAtom } from 'jotai';
import React, { useMemo, useState } from 'react';

interface NewFolderProps {
  title: string;
}

const NewFolder: React.FC<NewFolderProps> = ({ title }) => {
  const { closeAlertModal, closeModal, alertModal } = useModal();
  const [folderName, setFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useAtom(selectedFolderAtom);
  const { fetchFolderList } = useStudioFolder();

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.currentTarget.value);
  };

  const siblingFolders = useMemo(() => {
    if (!selectedFolder) {
      return [];
    }

    return selectedFolder.sub_folder || [];
  }, [selectedFolder]);

  const handleSaveButton = async () => {
    try {
      const folder = await addFolder();
      setSelectedFolder(folder);
      await fetchFolderList();
      closeAlertModal();
      closeModal();

      if (!selectedFolder || selectedFolder.depth < 1) {
        alertModal(`${infoMessage.CREATE_FOLDER_SUCCESS}`);
      } else {
        alertModal(
          <p>
            <span className="point">“{sliceString(selectedFolder?.name)}”</span>
            <br />
            {infoMessage.CREATE_CHILD_FOLDER_SUCCESS}
          </p>,
        );
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const { code } = err;
        if (code === 1202) {
          setSelectedFolder(null);
          fetchFolderList();
        }
      }
    }
  };

  const addFolder = async (): Promise<Folder> => {
    const newFolderName = folderName || 'Untitled Folder';

    const regex = new RegExp(`${newFolderName}(?:\\s\\((\\d+)\\))?`);

    const count = siblingFolders.reduce((acc, folder) => {
      return regex.test(folder.name) ? acc + 1 : acc;
    }, 0);

    const params: CreateFolderRequestType = {
      folder_name: count > 0 ? `${newFolderName} (${count + 1})` : newFolderName,
      parent_id: selectedFolder?.id || '',
    };

    const { data } = await createArchiveFolder(params);

    return {
      name: data.folder_name,
      create_id: data.create_id,
      id: data.id,
      parent_id: data.parent_id,
      sub_folder: data.sub_folder,
      depth: data.depth,
      created_at: data.created_at,
    };
  };
  return (
    <>
      <div className="new_folder modal_box">
        <div className="title small text_left">{title}</div>
        <div className="folder">
          <div className="ti">이름:</div>
          <div>
            <input type="text" id="ID" placeholder="Untitled Folder" onChange={onChangeInput} />
          </div>
        </div>
        <div className="modal_btns">
          <button className="cancel" onClick={closeAlertModal}>
            Cancel
          </button>
          <button className="Save" onClick={handleSaveButton}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default NewFolder;
