import { useEffect, useState } from 'react';
import { LocationBoxProps } from '@/types/modal';
import useModal from '@/hooks/useModal';
import SaveModal from './save_modal';
import FolderModal from './folder_modal';
import { Folder } from '@/types/archive/archive';
import { useAtom, useAtomValue } from 'jotai';
import { foldersWithStorageAtom, selectedFolderLocationAtom } from '@/atoms/folderAtoms';
import { selectedFolderAtom } from '@/atoms/studioAtoms';

const LocationBox = ({ isFolder, Callback }: LocationBoxProps) => {
  const [isDirectory, setIsDirectory] = useState(false);
  const [isFolderModal, setIsFolderModal] = useState(false);
  const { componentsModal } = useModal();

  const folders = useAtomValue(foldersWithStorageAtom);
  const [selectedFolderLocation, setSelectedFolderLocation] = useAtom(selectedFolderLocationAtom);
  const sidebarSelectedFolder = useAtomValue(selectedFolderAtom);

  useEffect(() => {
    if (isFolder) {
      setIsFolderModal(isFolder);
    }
  }, [isFolder]);

  // 이동시킬 위치 폴더 선택
  const selectFolder = (folder: Folder) => {
    setIsDirectory(false);
    setSelectedFolderLocation(folder);
  };

  useEffect(() => {
    setSelectedFolderLocation(selectedFolderLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolderLocation]);

  const expandLocationModal = () => {
    if (isFolderModal) {
      componentsModal(
        <SaveModal
          title="라이브러리에 저장하시겠습니까?"
          titles="새로운 폴더를 생성 또는 원하는 경로를 설정 후 저장해주세요."
          create={true}
          Callback={Callback}
        />,
      );
    } else {
      componentsModal(<FolderModal Callback={Callback} />);
    }
  };
  return (
    <div className="location">
      <div className="tx">위치:</div>
      <div className="directory">
        <div className="folder">
          <div>{selectedFolderLocation?.name}</div>
        </div>
        {/* 폴더 리스트 펼치기 위아래 버튼 */}
        <div className="updown" onClick={() => setIsDirectory(!isDirectory)}>
          <div className="up"></div>
          <div className="down"></div>
        </div>
        {/* 폴더 리스트 */}
        {isDirectory && (
          <div className="directory_list">
            {
              <ul>
                {folders &&
                  folders
                    .filter((folder) => folder.depth === 1 && folder.id !== sidebarSelectedFolder?.id)
                    .map((folder) => (
                      <li key={folder.id} className="folder" onClick={() => selectFolder(folder)}>
                        {folder.name}
                      </li>
                    ))}
              </ul>
            }
          </div>
        )}
      </div>
      {/* 검은색 아래 방향 버튼 */}
      <div className={`btn ${isDirectory ? 'open' : ''}`} onClick={expandLocationModal}></div>
    </div>
  );
};

export default LocationBox;
