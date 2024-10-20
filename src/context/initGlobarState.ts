import { IGlobalState } from './GlobalContext';

const initGlobalState: IGlobalState = {
  value: null,
  setValue: () => {
    return;
  },
  modalState: {
    show: false,
  },
  setModalState: () => {
    return;
  },
  childModalState: {
    show: false,
  },
  setChildModalState: () => {
    return;
  },
};

export default initGlobalState;
