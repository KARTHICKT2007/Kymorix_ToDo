import { useState, useEffect, useRef, useCallback } from 'react';
import { useTasks } from '../context/useTasks';
import { playSoundAlert } from '../utils/audio';

const toastConfigs = {
  success: {
    cardClass: 'toast-theme-success',
    iconClass: 'bi bi-check-circle-fill toast-icon-success',
    iconColor: '#10b981',
    badgeClass: 'bg-success bg-opacity-15 text-success'
  },
  danger: {
    cardClass: 'toast-theme-danger',
    iconClass: 'bi bi-x-octagon-fill toast-icon-danger',
    iconColor: '#ef4444',
    badgeClass: 'bg-danger bg-opacity-15 text-danger'
  },
  error: {
    cardClass: 'toast-theme-danger',
    iconClass: 'bi bi-x-octagon-fill toast-icon-danger',
    iconColor: '#ef4444',
    badgeClass: 'bg-danger bg-opacity-15 text-danger'
  },
  warning: {
    cardClass: 'toast-theme-warning',
    iconClass: 'bi bi-exclamation-triangle-fill toast-icon-warning',
    iconColor: '#f59e0b',
    badgeClass: 'bg-warning bg-opacity-20 text-warning'
  },
  info: {
    cardClass: 'toast-theme-info',
    iconClass: 'bi bi-info-circle-fill toast-icon-info',
    iconColor: '#4f46e5',
    badgeClass: 'bg-primary bg-opacity-15 text-primary'
  },
  export: {
    cardClass: 'toast-theme-export',
    iconClass: 'bi bi-cloud-arrow-down-fill toast-icon-export',
    iconColor: '#0ea5e9',
    badgeClass: 'bg-info bg-opacity-15 text-info'
  },
  print: {
    cardClass: 'toast-theme-print',
    iconClass: 'bi bi-printer-fill toast-icon-print',
    iconColor: '#8b5cf6',
    badgeClass: 'bg-secondary bg-opacity-15 text-purple'
  }
};

const ToastItem = ({ toast, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animDuration = Math.max(1500, Number(toast.duration) || 4000);
  const remainingTimeRef = useRef(animDuration);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const isDismissingRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (isDismissingRef.current) return;
    isDismissingRef.current = true;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 240);
  }, [onClose]);

  // Audio effect triggered on toast appearance
  useEffect(() => {
    if (toast.sound === 'none') return;

    const soundType = toast.sound || (
      toast.type === 'danger' || toast.type === 'error' ? 'error' :
      toast.type === 'warning' ? 'delete' :
      toast.type === 'export' || toast.type === 'print' ? 'notification' :
      toast.type === 'success' ? 'celebrate' : 'notification'
    );
    playSoundAlert(soundType);
  }, [toast.sound, toast.type]);

  // Auto-dismiss timer with absolute watchdog guarantee
  useEffect(() => {
    isDismissingRef.current = false;
    startTimeRef.current = Date.now();
    remainingTimeRef.current = animDuration;

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, animDuration);

    // Watchdog fallback timer to guarantee closing even if pointer/hover state freezes
    const watchdogTimer = setTimeout(() => {
      onClose();
    }, animDuration + 2500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(watchdogTimer);
    };
  }, [animDuration, handleDismiss, onClose]);

  const handleMouseEnter = () => {
    // Ignore touch devices to avoid stuck toasts on mobile
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      remainingTimeRef.current = Math.max(800, remainingTimeRef.current - elapsed);
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
      return;
    }
    if (isDismissingRef.current) return;
    setIsPaused(false);
    startTimeRef.current = Date.now();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);
  };

  const currentConfig = toastConfigs[toast.type] || toastConfigs.info;

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3 toast-container-mobile"
      style={{ zIndex: 1080 }}
    >
      <div
        className={`toast show border-0 shadow-lg rounded-4 overflow-hidden toast-card-custom ${currentConfig.cardClass} ${
          isClosing ? 'toast-closing' : 'toast-animated'
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        <div className="d-flex align-items-center p-2 px-2.5 gap-2 position-relative toast-body-custom">
          {/* Animated Icon Avatar */}
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${currentConfig.badgeClass} toast-icon-avatar`}
            style={{ width: '24px', height: '24px', fontSize: '0.82rem' }}
          >
            <i className={currentConfig.iconClass} style={{ color: currentConfig.iconColor }}></i>
          </div>

          {/* Toast Message */}
          <div className="flex-grow-1 min-w-0 pe-1">
            <div className="fw-semibold text-body small leading-snug toast-message-text" style={{ fontSize: '0.78rem' }}>
              {toast.message}
            </div>
          </div>

          {/* Optional Action Button (e.g., Undo) */}
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0.5 fw-bold flex-shrink-0"
              style={{ fontSize: '0.7rem' }}
              onClick={() => {
                toast.onAction();
                handleDismiss();
              }}
            >
              {toast.actionLabel}
            </button>
          )}

          {/* Close Button */}
          <button
            type="button"
            className="btn-close flex-shrink-0 ms-1"
            aria-label="Close"
            onClick={handleDismiss}
            style={{ fontSize: '0.65rem' }}
          ></button>
        </div>

        {/* Smooth Countdown Progress Bar */}
        <div className="toast-progress-track">
          <div
            key={`progress-${toast.id}`}
            className="toast-progress-fill"
            style={{
              backgroundColor: currentConfig.iconColor,
              animation: `toastCountdown ${animDuration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const ToastAlert = () => {
  const { toast, closeToast } = useTasks();

  if (!toast) return null;

  return <ToastItem key={toast.id} toast={toast} onClose={closeToast} />;
};
