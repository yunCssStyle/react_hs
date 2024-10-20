import { draftDatesWithStorageAtom } from '@/atoms/draftAtoms';
import DraftMenuItem from '../draft/draft_menu_item';
import { useAtomValue } from 'jotai';

interface DraftMenuPropsType {
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
  reloadDate: () => void;
}

const DraftMenu = ({ selectedDate, setSelectedDate, reloadDate }: DraftMenuPropsType) => {
  const dates = useAtomValue(draftDatesWithStorageAtom);

  return (
    <>
      <div className="menu">
        <p>Date</p>
        <div className="menus">
          {dates &&
            dates.map((item, index) => (
              <DraftMenuItem
                key={index}
                date={item}
                selectedDate={selectedDate}
                transferClickDateId={setSelectedDate}
                reloadDate={reloadDate}
              ></DraftMenuItem>
            ))}
        </div>
      </div>
    </>
  );
};

export default DraftMenu;
