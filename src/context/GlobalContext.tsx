import { createContext, useState } from 'react';
import initGlobalState from './initGlobarState';

export const GlobalContext = createContext<IGlobalState>(initGlobalState);

type GlobalContextProviderProps = { children: React.ReactNode };

export function GlobalContextProvider({ children }: GlobalContextProviderProps) {
  const { Provider } = GlobalContext;
  //global state
  const [value, setValue] = useState<IGlobalState['value']>(initGlobalState.value);

  const [modalState, setModalState] = useState<modalStateType>(initGlobalState.modalState);
  const [childModalState, setChildModalState] = useState<modalStateType>(initGlobalState.modalState);

  // global state object
  const globalState: IGlobalState = {
    value,
    setValue,
    modalState,
    setModalState,
    childModalState,
    setChildModalState,
  };

  return <Provider value={globalState}>{children}</Provider>;
}

export type IGlobalState = {
  value: string | null;
  setValue: (value: string) => void;
  modalState: modalStateType;
  setModalState: (state: modalStateType) => void;
  childModalState: modalStateType;
  setChildModalState: (state: modalStateType) => void;
};

export type modalStateType = {
  show: boolean;
  title?: string;
  description?: string | React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  shouldHideCloseButton?: boolean;
  custom?: React.ReactNode;
  autoClose?: boolean;
};
