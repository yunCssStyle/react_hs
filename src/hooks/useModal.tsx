import { GlobalContext } from '@/context/GlobalContext';
import { useContext } from 'react';

const useModal = () => {
  const { setModalState, setChildModalState } = useContext(GlobalContext);

  const alertModal = (description: string | React.ReactNode, alertModalCallback?: () => void, cancelBtn?: boolean) => {
    setChildModalState({
      show: true,
      description: description,
      ...(cancelBtn && { onCancel: () => {} }),
      onConfirm: () => {
        alertModalCallback && alertModalCallback();
      },
    });
  };

  const componentsModal = (component: JSX.Element, autoClose = true) => {
    setModalState({
      show: true,
      custom: component,
      autoClose,
    });
  };

  const inputModal = (component: JSX.Element) => {
    setChildModalState({
      show: true,
      custom: component,
    });
  };

  const closeAlertModal = () => {
    setChildModalState({ show: false });
  };

  const closeModal = () => {
    setModalState({ show: false });
  };
  return {
    alertModal,
    componentsModal,
    inputModal,
    closeAlertModal,
    closeModal,
  };
};

export default useModal;
