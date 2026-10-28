import { useEffect } from 'react';
import { playSoundAlert } from '../utils/audio';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      playSoundAlert('click');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Tasks & Timer',
      items: [
        { key: 'N', desc: 'Create a new task' },
        { key: '/', desc: 'Quick search tasks & tags' },
        { key: 'P', desc: 'Open / Close Pomodoro Timer' },
        { key: 'Ctrl + Enter', desc: 'Save task in editor modal' }
      ]
    },
    {
      title: 'App & Navigation',
      items: [
        { key: 'D', desc: 'Toggle Dark / Light Mode' },
        { key: '?', desc: 'Show this shortcuts guide' },
        { key: 'Esc', desc: 'Close dialogs, menus & timer' }
      ]
    }
  ];

  return (
    <div
      className="modal fade show d-block modal-animated-backdrop"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-animated-dialog"
        style={{ maxWidth: '420px', margin: '1.25rem auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content shadow border rounded-3 overflow-hidden">
          {/* Compact Header */}
          <div className="modal-header py-2.5 px-3.5 bg-body-tertiary border-bottom">
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded-2 d-flex align-items-center justify-content-center text-primary bg-primary bg-opacity-10"
                style={{ width: '26px', height: '26px' }}
              >
                <i className="bi bi-keyboard fs-6"></i>
              </span>
              <h6 id="shortcuts-modal-title" className="modal-title fw-bold mb-0" style={{ fontSize: '0.95rem' }}>
                Keyboard Shortcuts
              </h6>
            </div>
            <button
              type="button"
              className="btn-close"
              style={{ fontSize: '0.75rem' }}
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Compact Body without unnecessary space */}
          <div className="modal-body p-3">
            {shortcutGroups.map((group, gIdx) => (
              <div key={group.title} className={gIdx > 0 ? 'mt-2.5 pt-2 border-top' : ''}>
                <div
                  className="text-uppercase fw-bold text-muted px-1 mb-1.5"
                  style={{ fontSize: '0.66rem', letterSpacing: '0.05em' }}
                >
                  {group.title}
                </div>
                <div className="d-flex flex-column gap-1">
                  {group.items.map((sc, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center py-1.5 px-2 rounded-2 hover-bg-body-secondary"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <span className="text-body fw-medium">{sc.desc}</span>
                      <kbd
                        className="bg-body-secondary text-body border px-1.5 py-0.5 rounded shadow-xs font-monospace small"
                        style={{ fontSize: '0.72rem', letterSpacing: '0.02em', minWidth: '22px', textAlign: 'center' }}
                      >
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Neat, Compact Footer */}
          <div className="modal-footer py-2 px-3 bg-body-tertiary border-top d-flex justify-content-between align-items-center">
            <span className="text-secondary small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
              <span>Press</span>
              <kbd className="bg-body text-body border px-1 py-0 rounded small" style={{ fontSize: '0.68rem' }}>Esc</kbd>
              <span>to dismiss</span>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3 py-1 rounded-2 fw-medium"
              style={{ fontSize: '0.8rem' }}
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
