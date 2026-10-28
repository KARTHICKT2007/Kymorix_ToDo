import { useState, useEffect, useRef, useCallback } from 'react';

const TUTORIAL_STORAGE_KEY = 'kymorix_tutorial_completed';

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Welcome to Kymorix',
    badge: 'Overview',
    icon: 'bi-stars',
    iconColor: '#4f46e5',
    targetSelector: null,
    description:
      'Your modern, cloud-synced productivity workspace. Organize daily priorities, break down complex projects, and master deep work with the built-in Pomodoro timer.',
    highlightText: 'Ready for a quick 30-second tour of key features?'
  },
  {
    step: 2,
    title: 'Create Your Tasks',
    badge: 'Task Creation',
    icon: 'bi-plus-circle-fill',
    iconColor: '#10b981',
    targetSelector: '.quick-add-card, .quick-add-form',
    fallbackSelector: '#btn-new-task, .mobile-fab',
    description:
      'Type any action item in the Quick Add bar and press Enter to instantly capture thoughts. Or click "+ Add Task" (or press N) to open the full task editor with tags, dates, and checklists.',
    highlightText: 'Capture tasks quickly so nothing slips through the cracks.'
  },
  {
    step: 3,
    title: 'Priorities & Deadlines',
    badge: 'Organization',
    icon: 'bi-flag-fill',
    iconColor: '#f59e0b',
    targetSelector: '.task-sort-wrap, .task-header-row',
    fallbackSelector: '.task-badges-row, .task-header-title',
    description:
      'Categorize tasks by urgency with High, Medium, and Low priorities, plus custom categories and due dates. Sort your list alphabetically, by due date, or by priority anytime.',
    highlightText: 'Keep what matters most clearly separated and organized.'
  },
  {
    step: 4,
    title: 'Smart Checklists',
    badge: 'Subtasks',
    icon: 'bi-check2-square',
    iconColor: '#0ea5e9',
    targetSelector: '.modern-card .task-badges-row, .modern-card',
    fallbackSelector: '.task-list-main-wrap',
    description:
      'Break big projects down into bite-sized actionable steps. Add checklist items inside tasks and watch your live subtask progress bar advance as you tick off milestones.',
    highlightText: 'Turn overwhelming projects into small, achievable steps.'
  },
  {
    step: 5,
    title: 'Mark as Completed',
    badge: 'Productivity',
    icon: 'bi-check-circle-fill',
    iconColor: '#16a34a',
    targetSelector: '.task-complete-btn, .modern-card .btn-outline-secondary',
    fallbackSelector: '.modern-card',
    description:
      'Click the circle checkmark on any task when you finish it! Celebrate your accomplishment with celebratory confetti, track your completion rate, or use Undo if you clicked by mistake.',
    highlightText: 'Enjoy visual momentum as you clear your daily agenda.'
  },
  {
    step: 6,
    title: "You're All Set!",
    badge: 'Ready to Go',
    icon: 'bi-rocket-takeoff-fill',
    iconColor: '#8b5cf6',
    targetSelector: null,
    description:
      'Sign in with Google to sync in real-time across your phone, tablet, and computer. You can replay this interactive tutorial anytime from the menu.',
    highlightText: 'Have a productive day with Kymorix!'
  }
];

export const OnboardingTutorial = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [popoverPlacement, setPopoverPlacement] = useState('center');
  const popupRef = useRef(null);

  const currentStep = TUTORIAL_STEPS[currentStepIndex] || TUTORIAL_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  // Locate the target element and calculate bounds
  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;

    const selector = currentStep.targetSelector;
    let targetEl = selector ? document.querySelector(selector) : null;

    if (!targetEl && currentStep.fallbackSelector) {
      targetEl = document.querySelector(currentStep.fallbackSelector);
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      // Ensure target is on screen
      if (rect.top < 60 || rect.bottom > window.innerHeight - 60) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Re-read rect after potential scroll
      const updatedRect = targetEl.getBoundingClientRect();
      setTargetRect({
        top: Math.max(0, updatedRect.top),
        left: Math.max(0, updatedRect.left),
        width: updatedRect.width,
        height: updatedRect.height,
        bottom: updatedRect.bottom,
        right: updatedRect.right
      });

      // Determine optimal popover placement (above vs below vs center)
      const isMobile = window.innerWidth <= 576;
      if (isMobile) {
        if (updatedRect.top > window.innerHeight * 0.55) {
          setPopoverPlacement('top');
        } else {
          setPopoverPlacement('bottom');
        }
      } else {
        const spaceBelow = window.innerHeight - updatedRect.bottom;
        const spaceAbove = updatedRect.top;
        if (spaceBelow >= 240) {
          setPopoverPlacement('bottom');
        } else if (spaceAbove >= 240) {
          setPopoverPlacement('top');
        } else {
          setPopoverPlacement('center');
        }
      }
    } else {
      setTargetRect(null);
      setPopoverPlacement('center');
    }
  }, [isOpen, currentStep]);

  // Recalculate target position on step change, resize, or scroll
  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      updateTargetPosition();
    });

    const handleResizeOrScroll = () => {
      updateTargetPosition();
    };

    window.addEventListener('resize', handleResizeOrScroll, { passive: true });
    window.addEventListener('scroll', handleResizeOrScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  const handleFinish = useCallback(() => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // Storage access safety
    }
    onClose();
    setCurrentStepIndex(0);
  }, [onClose]);

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // Storage access safety
    }
    onClose();
    setCurrentStepIndex(0);
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1));
    }
  }, [isLastStep, handleFinish]);

  const handleBack = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // Keyboard navigation: Escape to skip, Left Arrow for Back, Right Arrow / Enter for Next
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handleBack, handleSkip]);

  if (!isOpen) return null;

  // Calculate popover positioning styles
  let popoverStyle = {};
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 576;

  if (popoverPlacement === 'center' || !targetRect) {
    popoverStyle = {
      position: 'fixed',
      zIndex: 1095
    };
  } else if (popoverPlacement === 'bottom' && targetRect) {
    if (isMobile) {
      popoverStyle = {
        position: 'fixed',
        top: `${Math.min(window.innerHeight - 260, targetRect.bottom + 12)}px`,
        zIndex: 1095
      };
    } else {
      const desiredLeft = Math.max(20, Math.min(window.innerWidth - 390, targetRect.left + targetRect.width / 2 - 185));
      popoverStyle = {
        position: 'fixed',
        top: `${Math.min(window.innerHeight - 260, targetRect.bottom + 12)}px`,
        left: `${desiredLeft}px`,
        width: '370px',
        maxWidth: '90vw',
        zIndex: 1095
      };
    }
  } else if (popoverPlacement === 'top' && targetRect) {
    if (isMobile) {
      popoverStyle = {
        position: 'fixed',
        bottom: `${Math.max(16, window.innerHeight - targetRect.top + 12)}px`,
        zIndex: 1095
      };
    } else {
      const desiredLeft = Math.max(20, Math.min(window.innerWidth - 390, targetRect.left + targetRect.width / 2 - 185));
      popoverStyle = {
        position: 'fixed',
        bottom: `${Math.max(16, window.innerHeight - targetRect.top + 12)}px`,
        left: `${desiredLeft}px`,
        width: '370px',
        maxWidth: '90vw',
        zIndex: 1095
      };
    }
  }

  return (
    <div className="onboarding-tutorial-wrapper" aria-modal="true" role="dialog">
      {/* Dark Spotlight Backdrop Overlay */}
      <div className="onboarding-overlay" onClick={handleSkip} />

      {/* Target Element Spotlight Glow Cutout */}
      {targetRect && (
        <div
          className="onboarding-spotlight-box"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`
          }}
        />
      )}

      {/* Tutorial Popover Card */}
      <div
        ref={popupRef}
        className={`onboarding-card shadow-lg border-0 rounded-4 overflow-hidden placement-${popoverPlacement}`}
        style={popoverStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Step Indicator & Dismiss */}
        <div className="onboarding-card-header p-2.5 p-sm-3 d-flex align-items-center justify-content-between border-bottom gap-2">
          <div className="d-flex align-items-center gap-1.5 min-w-0">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2 py-1 text-nowrap flex-shrink-0"
              style={{
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                color: '#4f46e5',
                fontSize: '0.66rem',
                letterSpacing: '0.04em'
              }}
            >
              Step {currentStep.step} of {TUTORIAL_STEPS.length}
            </span>
            <span className="text-secondary small fw-semibold text-truncate d-none d-sm-inline" style={{ fontSize: '0.74rem' }}>
              {currentStep.badge}
            </span>
          </div>

          {/* Interactive Step Dots */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                className={`onboarding-step-dot ${idx === currentStepIndex ? 'active' : ''} ${
                  idx < currentStepIndex ? 'completed' : ''
                }`}
                onClick={() => setCurrentStepIndex(idx)}
                title={`Jump to Step ${s.step}: ${s.title}`}
                aria-label={`Jump to Step ${s.step}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="btn-close flex-shrink-0 ms-1"
            style={{ fontSize: '0.72rem' }}
            onClick={handleSkip}
            title="Skip Tutorial (Esc)"
            aria-label="Skip Tutorial"
          />
        </div>

        {/* Card Body with Icon & Step Explanation */}
        <div className="p-3 p-sm-3.5 onboarding-card-body">
          <div className="d-flex align-items-start gap-2.5 mb-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: `${currentStep.iconColor}15`,
                color: currentStep.iconColor,
                fontSize: '1.2rem'
              }}
            >
              <i className={`bi ${currentStep.icon}`}></i>
            </div>
            <div className="min-w-0 flex-grow-1">
              <h5 className="fw-bold mb-1 text-break" style={{ fontSize: '1rem', lineHeight: '1.3' }}>
                {currentStep.title}
              </h5>
              <p className="text-secondary mb-0 small leading-relaxed text-break" style={{ fontSize: '0.82rem' }}>
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Highlight Accent Box */}
          {currentStep.highlightText && (
            <div
              className="rounded-3 p-2 my-2 border d-flex align-items-center gap-2"
              style={{
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                borderColor: 'rgba(79, 70, 229, 0.15)'
              }}
            >
              <i className="bi bi-lightbulb-fill text-warning flex-shrink-0" style={{ fontSize: '0.88rem' }}></i>
              <span className="small text-body fw-medium" style={{ fontSize: '0.75rem' }}>
                {currentStep.highlightText}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Action Buttons Footer */}
        <div className="onboarding-card-footer p-2.5 p-sm-3 d-flex align-items-center justify-content-between border-top gap-2">
          <div>
            {!isFirstStep ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.8rem', minHeight: '34px' }}
                onClick={handleBack}
              >
                <i className="bi bi-arrow-left"></i>
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-link text-secondary text-decoration-none p-0 small fw-semibold"
                style={{ fontSize: '0.8rem', minHeight: '34px' }}
                onClick={handleSkip}
              >
                Skip Tutorial
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {!isLastStep && !isFirstStep && (
              <button
                type="button"
                className="btn btn-sm btn-link text-secondary text-decoration-none p-0 small me-1"
                style={{ fontSize: '0.78rem', minHeight: '34px' }}
                onClick={handleSkip}
              >
                Skip
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{ fontSize: '0.84rem', minHeight: '34px' }}
              onClick={handleNext}
            >
              {isLastStep ? (
                <>
                  <span>Get Started</span>
                  <i className="bi bi-rocket-takeoff"></i>
                </>
              ) : isFirstStep ? (
                <>
                  <span>Start Tour</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
