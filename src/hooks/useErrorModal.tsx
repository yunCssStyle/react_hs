import useModal from '@/hooks/useModal';
import { getErrorMessage } from '@/utils/errorMessage';
import { AxiosError } from 'axios';

function useErrorModal() {
  const { alertModal } = useModal();

  const showErrorModal = (err: unknown) => {
    if (err && typeof err === 'object' && 'axiosError' in err) {
      return;
    }

    if (err instanceof AxiosError) {
      return;
    }

    alertModal(getErrorMessage(err));
  };

  const showAxiosErrorModal = (err: unknown) => {
    alertModal(getErrorMessage(err));
  };

  return { showErrorModal, showAxiosErrorModal };
}

export default useErrorModal;
