import useModal from '@/hooks/useModal';
import NewFolder from './new_folder';

const CreateBtn = () => {
  const { inputModal } = useModal();

  const create = () => {
    inputModal(<NewFolder title="새로운 폴더" />);
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
