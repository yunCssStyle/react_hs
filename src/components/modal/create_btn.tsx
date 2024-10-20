import useModal from '@/hooks/useModal';
import NewFolder from './new_folder';
import devLog from '@/utils/devLog';
import { Folder } from '@/types/archive/archive';

interface CreateBtnProps {
  selectedFolder?: Folder;
  Callback?: () => void;
}

const CreateBtn = ({ Callback }: CreateBtnProps) => {
  const { inputModal, closeAlertModal, closeModal } = useModal();

  const createConfirm = () => {
    devLog('확인 버튼이 클릭되었습니다.');
    closeAlertModal();
    closeModal();
    Callback!();
  };

  const create = () => {
    inputModal(<NewFolder title="새로운 폴더" Callback={createConfirm} />);
  };
  return (
    <div className="create">
      <div className="create_folder" onClick={create}>
        Create Folder
      </div>
    </div>
  );
};

export default CreateBtn;
