import { ContentFilterType, OrderFilterType } from '@/types/common';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Select, { SingleValue } from 'react-select';

const options: { value: OrderFilterType; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된 순' },
  { value: 'name', label: '이름 순' },
];

interface SortingProps {
  changeOrderFilter?: (value?: OrderFilterType) => void;
  contentFilter?: ContentFilterType[] | null;
  setContentFilter?: React.Dispatch<React.SetStateAction<ContentFilterType[] | null>>;
}

const Sorting = ({ changeOrderFilter, contentFilter, setContentFilter }: SortingProps) => {
  const location = useLocation();

  const [isFiiter, setIsFiiter] = useState(false);
  const optionMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 밖에 클릭 시 메뉴 닫힘
  const handleClickOutside = (e: any) => {
    if (optionMenuRef.current && !optionMenuRef.current.contains(e.target)) {
      setIsFiiter(false);
    }
  };

  // 순서 셀렉트 이벤트
  const onChangeSelect = (e: SingleValue<{ value: OrderFilterType; label: string }>) => {
    changeOrderFilter!(e?.value);
  };

  // 체크박스 이벤트
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.id as ContentFilterType;
    const checked = event.target.checked;

    setContentFilter!((prev) => {
      if (prev === null) {
        return checked ? [value] : null;
      }

      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter((item) => item !== value);
      }
    });
  };

  // 컨텐츠 필터 X 아이콘 클릭
  const handleIconClick = (value: ContentFilterType) => {
    setContentFilter!((prev) => {
      if (prev === null) {
        return null;
      }
      return prev.filter((item) => item !== value);
    });
  };
  // location.pathname.includes('draft')
  return (
    <div className="sorting">
      <div className="fiiter">
        {location.pathname.includes('draft') === false && (
          <div className="fiiter_btn" onClick={() => setIsFiiter(true)}>
            Fiiter
          </div>
        )}
        {isFiiter && (
          <ul ref={optionMenuRef as React.RefObject<HTMLUListElement>}>
            <li>
              <input
                type="checkbox"
                id="File"
                checked={contentFilter ? contentFilter.includes('File') : false}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="File">File</label>
            </li>
            <li>
              <input
                type="checkbox"
                id="Copy"
                checked={contentFilter ? contentFilter.includes('Copy') : false}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="Copy">Copy</label>
            </li>
            <li>
              <input
                type="checkbox"
                id="Folder"
                checked={contentFilter ? contentFilter.includes('Folder') : false}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="Folder">Folder</label>
            </li>
          </ul>
        )}
      </div>
      <div className="fiiter_tag">
        {contentFilter &&
          contentFilter.map((filter) => (
            <span key={filter}>
              {filter}
              <i onClick={() => handleIconClick(filter)} />
            </span>
          ))}
      </div>
      <Select
        className="select"
        options={options}
        defaultValue={options[0]}
        onChange={onChangeSelect}
        classNamePrefix="select"
      />
    </div>
  );
};

export default Sorting;
