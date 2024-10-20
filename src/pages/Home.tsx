import VisualImg from '@/assets/images/home/visual_img.png';
import EditorImg from '@/assets/images/home/editor.png';
import { Link } from 'react-router-dom';
import { MacScrollbar } from 'mac-scrollbar';
import { useEffect } from 'react';
import { getArchiveFolderList } from '@/api/archive/archive';
import { useAtom } from 'jotai';
import { foldersWithStorageAtom, untitledFolderCount } from '@/atoms/folderAtoms';
import { Folder } from '@/types/archive/archive';

const Home = () => {
  const [, setFolderList] = useAtom(foldersWithStorageAtom);
  const [, setUntitledFolderCount] = useAtom(untitledFolderCount);

  useEffect(() => {
    getFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFolders = async () => {
    const data = await getArchiveFolderList();
    const folders = data.data;
    setFolderList(folders);
    handleUntitledFolderCount(folders);
  };

  // Untitled Folder 폴더명 가진 폴더 개수 세팅
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

  return (
    <MacScrollbar className="home">
      <div className="visual">
        <div className="bg">
          <div className="home_editor">
            <div className="visual_editor">
              <img src={EditorImg} alt="Editor" />
            </div>
            <img src={VisualImg} alt="Visual" />
          </div>
          <div className="button">
            {}
            <Link to="/studio">Go to Studio</Link>
          </div>
        </div>
      </div>
      <div className="home_card">
        <ul>
          <li className="card1">
            <p>생산성 향상</p>
            <div>
              InspireAI는 최적화된 퍼포먼스
              <br />
              광고 카피를 빠르게 제공합니다.
              <br />
              프롬프트 선택을 통해 누구나
              <br />
              쉽게 고품질의 카피를 만나보세요.
            </div>
          </li>
          <li className="card2">
            <p>간편한 제작</p>
            <div>
              디자인 툴 활용이 어려우셨나요?
              <br />
              InspireAI의 이미지 업로드와
              <br />
              텍스트 편집 기능으로 쉽고
              <br />
              빠르게 배너를 만들어보세요.
            </div>
          </li>
          <li className="card3">
            <p>작업물 저장</p>
            <div>
              InspireAI가 당신의 작업물을
              <br />
              안전하게 보관합니다. Archive에
              <br />
              저장된 나만의 작업물을
              <br />
              언제든지 다시 만날 수 있습니다.
            </div>
          </li>
        </ul>
      </div>
    </MacScrollbar>
  );
};

export default Home;
