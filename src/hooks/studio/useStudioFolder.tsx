import { getArchiveFolderList } from '@/api/archive/archive';
import { folderListAtom, selectedFolderAtom } from '@/atoms/studioAtoms';
import { extractFolders } from '@/utils';
import { useAtom } from 'jotai';

const useStudioFolder = () => {
  const [, setFolderList] = useAtom(folderListAtom);
  const [selectedFolder, setSelectedFolder] = useAtom(selectedFolderAtom);

  const fetchFolderList = async () => {
    const { data } = await getArchiveFolderList();
    setFolderList(data);

    if (selectedFolder && extractFolders(data).filter((folder) => folder.id === selectedFolder.id)?.length < 1) {
      setSelectedFolder(null);
    }

    if (!selectedFolder && data.length > 0) {
      setSelectedFolder(data[0]);
    }
  };

  return { fetchFolderList };
};

export default useStudioFolder;
