import { useEffect, useRef, useState } from 'react';
import { playSoundAlert } from '../utils/audio';

export const ConfirmModal = ({
  isOpen,
  title = 'Delete Task?',
  message = 'Are you sure you want to delete this task? This action cannot be undone.',
  confirmText = 'Allow Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon = 'trash',
  onConfirm,
  onClose,
  onCancel
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const confirmBtnRef = useRef(null);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsClosing(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      playSoundAlert('popup-open');
      const timer = setTimeout(() => confirmBtnRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleConfirm = () => {
    playSoundAlert('confirm');
    setIsClosing(true);
    setTimeout(() => {
      onConfirm?.();
      onClose();
      setIsClosing(false);
    }, 180);
  };

  const handleCancel = () => {
    playSoundAlert('cancel');
    setIsClosing(true);
    setTimeout(() => {
      onCancel?.();
      onClose();
      setIsClosing(false);
    }, 180);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isClosing) {
      e.preventDefault();
      handleCancel();
    }
  };

  const iconDetails = {
    trash: {
      class: 'bi bi-trash3-fill text-danger',
      bg: 'bg-danger bg-opacity-10'
    },
    alert: {
      class: 'bi bi-exclamation-triangle-fill text-warning',
      bg: 'bg-warning bg-opacity-15'
    },
    info: {
      class: 'bi bi-info-circle-fill text-primary',
      bg: 'bg-primary bg-opacity-10'
    }
  };

  const curIcon = iconDetails[icon] || iconDetails.trash;

  return (
    <div
      className={`modal fade show d-block modal-animated-backdrop ${isClosing ? 'is-closing' : ''}`}
      tabIndex="-1"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      onKeyDown={handleKeyDown}
      onClick={handleCancel}
    >
      <div
        className={`modal-dialog modal-dialog-centered modal-animated-dialog ${isClosing ? 'is-closing' : ''}`}
        style={{ maxWidth: '400px', margin: '1.25rem auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-center p-3.5 p-sm-4 bg-body">
          <div
            className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center ${curIcon.bg} confirm-icon-pulse`}
            style={{ width: '56px', height: '56px', fontSize: '1.45rem' }}
          >
            <i className={curIcon.class}></i>
          </div>

          <h5 className="fw-bold mb-2 text-body" id="confirm-modal-title">
            {title}
          </h5>
          <p className="text-secondary small mb-4 px-2 text-break" id="confirm-modal-desc" style={{ lineHeight: '1.5' }}>
            {message}
          </p>

          <div className="d-flex justify-content-center gap-2 flex-wrap-reverse">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-3.5 py-2 fw-semibold small confirm-btn-cancel"
              onClick={handleCancel}
              disabled={isClosing}
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              className={`btn btn-${confirmVariant} rounded-pill px-3.5 py-2 fw-semibold shadow-sm small confirm-btn-allow d-inline-flex align-items-center justify-content-center gap-1.5`}
              onClick={handleConfirm}
              disabled={isClosing}
            >
              <i className="bi bi-trash3-fill" style={{ fontSize: '0.85rem' }}></i>
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
