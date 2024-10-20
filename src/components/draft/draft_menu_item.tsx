import React, { useEffect, useRef, useState } from 'react';
import useModal from '@/hooks/useModal';
import { deleteDraftByDate } from '@/api/draft/draft';
import { userActionPrompt } from '@/constants/infoMessage';

interface DraftMenuItemProps {
  date: string;
  selectedDate: string | null;
  transferClickDateId: React.Dispatch<React.SetStateAction<string | null>>;
  reloadDate: () => void;
}

const DraftMenuItem = ({ date, selectedDate, transferClickDateId, reloadDate }: DraftMenuItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTop, setOpenTop] = useState<number>();
  const [isOption, setIsption] = useState(false);
  const optionMenuRef = useRef<HTMLElement>(null);
  const { alertModal } = useModal();

  const toggleSubMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    setIsption(true);
    const clickedElement = event.currentTarget as HTMLElement | null;
    if (clickedElement) {
      const top = clickedElement.getBoundingClientRect().top;
      setOpenTop(top + 16);
    }
  };

  const handleClickOutside = (e: any) => {
    if (optionMenuRef.current && !optionMenuRef.current.contains(e.target)) {
      setIsption(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const deleteConfirm = async () => {
    if (!selectedDate) return;
    const params: { date: string } = { date: selectedDate };
    await deleteDraftByDate(params);
    reloadDate();
  };

  const deleteClick = () => {
    alertModal(userActionPrompt.DELETE_ONE, deleteConfirm, true);
  };

  const clickDate = (date: string) => {
    transferClickDateId(date);
  };

  return (
    <div onClick={() => clickDate(date)}>
      <div
        className={`${isOpen ? 'open' : ''}`}
        style={{ backgroundColor: selectedDate === date ? 'rgba(3, 206, 121, 0.1)' : 'initial' }}
      >
        <span className="label" onClick={toggleSubMenu}>
          {date}
        </span>
        <span className={`option ${isOption ? 'open' : ''}`} onClick={handleOptionClick}></span>
        {isOption && (
          <ul
            className="option_menu"
            style={{ top: isOpenTop }}
            ref={optionMenuRef as React.RefObject<HTMLUListElement>}
          >
            <li onClick={deleteClick}>Delete</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default DraftMenuItem;
