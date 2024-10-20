import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';

const options = [
  { value: 'chocolate', label: '최신순' },
  { value: 'strawberry', label: '오래된 순' },
  { value: 'vanilla', label: '이름 순' },
];

const DraftSorting = () => {
  const [isFiiter, setIsFiiter] = useState(false);
  const optionMenuRef = useRef<HTMLElement>(null);

  const handleClickOutside = (e: any) => {
    if (optionMenuRef.current && !optionMenuRef.current.contains(e.target)) {
      setIsFiiter(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sorting">
      <div className="fiiter">
        <div className="fiiter_btn" onClick={() => setIsFiiter(true)}>
          Fiiter
        </div>
        {isFiiter && (
          <ul ref={optionMenuRef as React.RefObject<HTMLUListElement>}>
            <li>
              <input type="checkbox" id="File" />
              <label htmlFor="File">File</label>
            </li>
            <li>
              <input type="checkbox" id="Copy" />
              <label htmlFor="Copy">Copy</label>
            </li>
            <li>
              <input type="checkbox" id="Folder" />
              <label htmlFor="Folder">Folder</label>
            </li>
          </ul>
        )}
      </div>
      <div className="fiiter_tag">
        <span>
          Copy
          <i />
        </span>
      </div>
      <Select className="select" options={options} defaultValue={options[0]} classNamePrefix="select" />
    </div>
  );
};

export default DraftSorting;
