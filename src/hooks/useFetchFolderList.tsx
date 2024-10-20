import { getArchiveFolderList } from '@/api/archive/archive';
import { Folder } from '@/types/archive/archive';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { foldersWithStorageAtom, selectedFolderAtom, selectedFolderLocationAtom } from '@/atoms/folderAtoms';

// API 호출을 처리하는 함수들
const fetchFolders = async () => {
  const data = await getArchiveFolderList();
  return data.data || [];
};

const useFetchFolderList = () => {
  const [, setFolderList] = useAtom(foldersWithStorageAtom);
  const [sidebarSelectedFolder, setSidebarSelectedFolder] = useAtom(selectedFolderAtom);
  const [, setDestinationFolder] = useAtom(selectedFolderLocationAtom);
  const [untitledFolderCount, setUntitledFolderCount] = useState<number>(0);

  const handleUntitledFolderCount = (folders: Folder[]) => {
    let count = 0;

    const recurse = (folderArray: Folder[]) => {
      for (const folder of folderArray) {
        if (folder.name.includes('Untitled Folder')) {
          count += 1;
        }
        if (folder.sub_folder.length > 0) {
          recurse(folder.sub_folder);
        }
      }
    };

    recurse(folders);
    setUntitledFolderCount(count);
  };

  const bindFolder = async () => {
    setFolderList(null);
    const fetchedFolders = await fetchFolders();
    setFolderList(fetchedFolders);
    setSidebarSelectedFolder(fetchedFolders[0]);
    setDestinationFolder(null);
    handleUntitledFolderCount(fetchedFolders);
  };

  return {
    sidebarSelectedFolder,
    untitledFolderCount,
    bindFolder,
  };
};

export default useFetchFolderList;
