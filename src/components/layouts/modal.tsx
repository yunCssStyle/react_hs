import { GlobalContext } from '@/context/GlobalContext';
import { useContext } from 'react';

export const CustomModal = () => {
  const { modalState, setModalState } = useContext(GlobalContext);

  const onClickModalConfirm = () => {
    modalState.onConfirm ? modalState.onConfirm() : setModalState({ show: false });
  };

  const onClickModalCancel = () => {
    setModalState({ show: false });
    modalState.onCancel && modalState.onCancel();
  };

  const isCustom = modalState.custom ? true : false;
  return (
    <div className={`modal ${modalState.show ? 'open' : ''}`}>
      <div className={`alert`}>
        {modalState.shouldHideCloseButton || (
          <span className="iconClose" onClick={onClickModalCancel}>
            X
          </span>
        )}
        {isCustom ? (
          <div className="alert_cont">{modalState.custom}</div>
        ) : (
          <div className="alert_cont">
            <div className="description">{modalState.description}</div>
            <div className="buttonBox">
              {modalState.onCancel && (
                <button className="cancel" onClick={onClickModalCancel}>
                  Cancel
                </button>
              )}
              {modalState.onConfirm && (
                <button className="ok" onClick={onClickModalConfirm}>
                  Ok
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// const ChildModal = () => {};
export const CustomChildModal = () => {
  const { childModalState, setChildModalState, setModalState, modalState } = useContext(GlobalContext);

  const onClickModalConfirm = () => {
    setChildModalState({ show: false });
    if (modalState.autoClose) {
      setModalState({ show: false });
    }
    childModalState.onConfirm && childModalState.onConfirm();
  };

  const onClickModalCancel = () => {
    setChildModalState({ show: false });
    childModalState.onCancel && childModalState.onCancel();
  };

  const isCustom = childModalState.custom ? true : false;

  return (
    <div className={`modal ${childModalState.show ? 'open' : ''}`}>
      <div className={`alert`}>
        {childModalState.shouldHideCloseButton || (
          <span className="iconClose" onClick={onClickModalCancel}>
            X
          </span>
        )}
        {isCustom ? (
          <div className="alert_cont">{childModalState.custom}</div>
        ) : (
          <div className="alert_cont">
            <div className="description">{childModalState.description}</div>
            <div className="buttonBox">
              {childModalState.onCancel && (
                <button className="cancel" onClick={onClickModalCancel}>
                  Cancel
                </button>
              )}
              {childModalState.onConfirm && (
                <button className="ok" onClick={onClickModalConfirm}>
                  Ok
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
