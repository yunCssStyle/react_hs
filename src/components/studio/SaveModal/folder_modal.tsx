import { MacScrollbar } from 'mac-scrollbar';
import LocationBox from './location_box';
import CreateBtn from './create_btn';
import { Folder } from '@/types/archive/archive';
import { SetStateAction, useCallback, useMemo } from 'react';
import { selectedFolderAtom } from '@/atoms/studioAtoms';
import { useAtom } from 'jotai';
import { extractFolders } from '@/utils';

interface FolderModalProps {
  folderList: Folder[];
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  callback: () => void;
}

const findAncestors = (allFolders: Folder[], currentFolderId?: string, ancestors: Folder[] = []): Folder[] => {
  const parentFolder = allFolders.find((folder) => folder.id === currentFolderId);

  if (!parentFolder) {
    return ancestors;
  }

  return findAncestors(allFolders, parentFolder.parent_id, [...ancestors, parentFolder]);
};

const FolderModal = ({ folderList, setIsOpen: setIsSelfOpen, callback }: FolderModalProps) => {
  const [selectedFolder, setSelectedFolder] = useAtom(selectedFolderAtom);

  const selectFolder = useCallback(
    (folder: Folder) => {
      setSelectedFolder(folder);
    },
    [setSelectedFolder],
  );

  const allFolders = useMemo(() => {
    return extractFolders(folderList);
  }, [folderList]);

  const folder1depth = useMemo(() => {
    return allFolders.filter((folder) => folder.depth === 1);
  }, [allFolders]);

  const folder2depth = useMemo(() => {
    if (!selectedFolder) {
      return [];
    }

    if (selectedFolder.depth === 1) {
      return selectedFolder.sub_folder || [];
    }

    if (selectedFolder.depth === 2) {
      const parentFolder = allFolders.find((folder) => folder.id === selectedFolder.parent_id);
      return parentFolder ? parentFolder.sub_folder || [] : [];
    }

    if (selectedFolder.depth === 3) {
      const parentFolder = allFolders.find((folder) => folder.id === selectedFolder.parent_id);
      const ancestorFolder = allFolders.find((folder) => folder.id === parentFolder?.parent_id);
      return ancestorFolder?.sub_folder || [];
    }

    return [];
  }, [selectedFolder, allFolders]);

  const folder3depth = useMemo(() => {
    if (!selectedFolder) {
      return [];
    }

    if (selectedFolder.depth === 3) {
      const parentFolder = allFolders.find((folder) => folder.id === selectedFolder.parent_id);
      return parentFolder?.sub_folder || [];
    }

    if (selectedFolder.depth === 2) {
      return selectedFolder.sub_folder || [];
    }

    return [];
  }, [selectedFolder, allFolders]);

  const ancestorFolders = useMemo(() => {
    const result = findAncestors(allFolders, selectedFolder?.parent_id);
    return result;
  }, [selectedFolder, allFolders]);

  return (
    <div className="modal open">
      <div className="alert">
        <span className="iconClose" onClick={() => setIsSelfOpen(false)}>
          X
        </span>

        <div className="folder_box modal_box">
          <div className="folder_list">
            <div className="ti">Folder</div>
            <ul>
              {folder1depth.map((folder) => (
                <li
                  onClick={() => selectFolder(folder)}
                  key={folder.id}
                  className={folder.id === selectedFolder?.id || ancestorFolders.includes(folder) ? 'on' : ''}
                >
                  <div>{folder.name}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="folder_location">
            <LocationBox isDirectoryOpen={true} setIsDirectoryOpen={setIsSelfOpen} />
            <div className="folders">
              <div>
                <MacScrollbar className="depth2">
                  <ul>
                    {folder2depth.map((folder) => (
                      <li
                        key={folder.id}
                        onClick={() => selectFolder(folder)}
                        className={`${folder.sub_folder.length > 0 ? 'next' : ''} ${
                          selectedFolder?.id === folder.id || ancestorFolders.includes(folder) ? 'on' : ''
                        }`}
                      >
                        <div>{folder.name}</div>
                      </li>
                    ))}
                  </ul>
                </MacScrollbar>
              </div>
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
              <CreateBtn />
              <div className="modal_btns">
                <button className="cancel" onClick={() => setIsSelfOpen(false)}>
                  Cancel
                </button>
                <button className="Save" onClick={() => callback()}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderModal;
