import { MacScrollbar } from 'mac-scrollbar';
import LocationBox from './location_box';
import CreateBtn from './create_btn';
import useModal from '@/hooks/useModal';
import { Folder } from '@/types/archive/archive';
import { useCallback, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { foldersWithStorageAtom, selectedFolderLocationAtom } from '@/atoms/folderAtoms';
import { CallbackType } from '@/types/modal';
import { extractFolders } from '@/utils';

interface FolderModalProps {
  Callback?: (type?: CallbackType) => void;
}

const findAncestors = (allFolders: Folder[], currentFolderId?: string, ancestors: Folder[] = []): Folder[] => {
  const parentFolder = allFolders.find((folder) => folder.id === currentFolderId);

  if (!parentFolder) {
    return ancestors;
  }

  return findAncestors(allFolders, parentFolder.parent_id, [...ancestors, parentFolder]);
};

const FolderModal = ({ Callback }: FolderModalProps) => {
  const { closeModal } = useModal();
  const [selectedFolder, setSelectedFolder] = useAtom(selectedFolderLocationAtom);
  const folderList = useAtomValue(foldersWithStorageAtom);

  const selectFolder = useCallback(
    (folder: Folder) => {
      setSelectedFolder(folder);
    },
    [setSelectedFolder],
  );

  const allFolders = useMemo(() => {
    if (!folderList) return;
    return extractFolders(folderList);
  }, [folderList]);

  const folder1depth = useMemo(() => {
    return allFolders?.filter((folder) => folder.depth === 1);
  }, [allFolders]);

  const folder2depth = useMemo(() => {
    if (!selectedFolder) {
      return [];
    }

    if (selectedFolder.depth === 1) {
      return selectedFolder.sub_folder || [];
    }

    if (selectedFolder.depth === 2) {
      const parentFolder = allFolders?.find((folder) => folder.id === selectedFolder.parent_id);
      return parentFolder ? parentFolder.sub_folder || [] : [];
    }

    if (selectedFolder.depth === 3) {
      const parentFolder = allFolders?.find((folder) => folder.id === selectedFolder.parent_id);
      const ancestorFolder = allFolders?.find((folder) => folder.id === parentFolder?.parent_id);
      return ancestorFolder?.sub_folder || [];
    }

    return [];
  }, [selectedFolder, allFolders]);

  const folder3depth = useMemo(() => {
    if (!selectedFolder) {
      return [];
    }

    if (selectedFolder.depth === 3) {
      const parentFolder = allFolders?.find((folder) => folder.id === selectedFolder.parent_id);
      return parentFolder?.sub_folder || [];
    }

    if (selectedFolder.depth === 2) {
      return selectedFolder.sub_folder || [];
    }

    return [];
  }, [selectedFolder, allFolders]);

  const ancestorFolders = useMemo(() => {
    if (!allFolders) return;
    const result = findAncestors(allFolders, selectedFolder?.parent_id);
    return result;
  }, [selectedFolder, allFolders]);

  return (
    <div className="folder_box modal_box">
      <div className="folder_list">
        <div className="ti">Folder</div>
        <ul>
          {folder1depth &&
            folder1depth.map((folder) => (
              <li
                onClick={() => selectFolder(folder)}
                key={folder.id}
                className={folder.id === selectedFolder?.id || ancestorFolders?.includes(folder) ? 'on' : ''}
              >
                <div>{folder.name}</div>
              </li>
            ))}
        </ul>
      </div>
      <div className="folder_location">
        {/* 위치 */}
        <LocationBox isFolder={true} Callback={Callback} />
        <div className="folders">
          {/* 뎁스 2 */}
          <div>
            <MacScrollbar className="depth2">
              <ul>
                {folder2depth.map((folder) => (
                  <li
                    key={folder.id}
                    onClick={() => selectFolder(folder)}
                    className={`${folder.sub_folder.length > 0 ? 'next' : ''} ${
                      selectedFolder?.id === folder.id || ancestorFolders?.includes(folder) ? 'on' : ''
                    }`}
                  >
                    <div>{folder.name}</div>
                  </li>
                ))}
              </ul>
            </MacScrollbar>
          </div>
          {/* 뎁스 3 */}
          <div>
            <MacScrollbar className="depth3">
              <ul>
                {folder3depth.map((folder) => (
                  <li
                    className={selectedFolder?.id === folder.id ? 'on' : ''}
                    onClick={() => selectFolder(folder)}
                    key={folder.id}
                  >
                    <div>{folder.name}</div>
                  </li>
                ))}
              </ul>
            </MacScrollbar>
          </div>
        </div>
        <div className="folder_btn">
          {/* 생성 버튼 */}
          <CreateBtn Callback={Callback} />
          <div className="modal_btns">
            <button className="cancel" onClick={closeModal}>
              Cancel
            </button>
            {/* 저장 버튼 */}
            <button className="Save" onClick={() => Callback!('move')}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderModal;
