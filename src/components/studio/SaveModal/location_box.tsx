import { SetStateAction } from 'react';

import { selectedFolderAtom } from '@/atoms/studioAtoms';
import { useAtom } from 'jotai';
interface LocationBoxProps {
  isDirectoryOpen: boolean;
  setIsDirectoryOpen: React.Dispatch<SetStateAction<boolean>>;
}

const LocationBox: React.FC<LocationBoxProps> = ({ isDirectoryOpen, setIsDirectoryOpen }) => {
  const [selectedFolder] = useAtom(selectedFolderAtom);

  return (
    <div className="location">
      <div className="tx">위치:</div>
      <div className="directory">
        <div className="folder">
          <div>{selectedFolder?.name}</div>
        </div>
        {/* <div className="updown">
          <div className="up"></div>
          <div className="down"></div>
        </div> */}
      </div>
      <div
        className={`btn ${isDirectoryOpen ? '' : 'open'}`}
        onClick={() => {
          setIsDirectoryOpen((prev) => !prev);
        }}
      ></div>
    </div>
  );
};

export default LocationBox;
