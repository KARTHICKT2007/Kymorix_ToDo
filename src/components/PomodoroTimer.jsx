import { useState, useEffect, useRef, useCallback } from 'react';
import { useTasks } from '../context/useTasks';
import { playSoundAlert } from '../utils/audio';

const DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

const MODES = [
  { id: 'focus', label: 'Focus', icon: '🍅' },
  { id: 'shortBreak', label: 'Short', icon: '☕' },
  { id: 'longBreak', label: 'Long', icon: '🛋️' }
];

export const PomodoroTimer = ({ isVisible, onOpen, onClose }) => {
  const {
    activePomodoroTaskId,
    activePomodoroTask,
    setActivePomodoroTaskId,
    tasks,
    incrementPomodoro,
    showToast
  } = useTasks();

  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prevIsVisible, setPrevIsVisible] = useState(isVisible);

  // Official React pattern: adjust state when a prop changes without useEffect
  if (isVisible !== prevIsVisible) {
    setPrevIsVisible(isVisible);
    if (isVisible) {
      setIsMinimized(false);
    }
  }

  const timerRef = useRef(null);

  const switchMode = useCallback((newMode) => {
    playSoundAlert('click');
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    playSoundAlert('complete');

    if (mode === 'focus') {
      const nextSessions = sessionsCompleted + 1;
      setSessionsCompleted(nextSessions);

      if (activePomodoroTaskId) {
        incrementPomodoro(activePomodoroTaskId);
      }

      showToast('Pomodoro session finished! Take a well-deserved break ☕', 'success', null, null, 5000);

      if (nextSessions % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      showToast('Break is over! Time to get back in the flow 🚀', 'info', null, null, 5000);
      switchMode('focus');
    }
  }, [mode, sessionsCompleted, activePomodoroTaskId, incrementPomodoro, showToast, switchMode]);

  // Timer tick effect - keeps running continuously in background without resetting
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleTimerComplete]);

  const toggleStartPause = () => {
    playSoundAlert('click');
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);

    if (nextRunning) {
      if (mode === 'focus') {
        if (activePomodoroTask) {
          showToast(`Focus started for "${activePomodoroTask.title}"`, 'info', null, null, 2500);
        } else {
          showToast('Focus session started (25 mins)', 'info', null, null, 2000);
        }
      } else {
        showToast('Break timer started', 'info', null, null, 2000);
      }
    } else {
      showToast('Timer paused', 'info', null, null, 1500);
    }
  };

  const resetTimer = () => {
    playSoundAlert('click');
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
    showToast('Timer reset', 'info', null, null, 1500);
  };

  const handleMinimize = () => {
    playSoundAlert('click');
    setIsMinimized(true);
    showToast('Timer minimized to floating popup', 'info', null, null, 1800);
  };

  const handleReopen = () => {
    playSoundAlert('click');
    setIsMinimized(false);
    if (!isVisible) {
      onOpen?.();
    }
  };

  const handleClose = () => {
    playSoundAlert('click');
    setIsMinimized(false);
    onClose?.();
  };

  const handleDismissMini = () => {
    playSoundAlert('click');
    setIsMinimized(false);
    setIsRunning(false);
    onClose?.();
  };

  const handleTargetChange = (e) => {
    const val = e.target.value || null;
    setActivePomodoroTaskId(val);
    playSoundAlert('click');

    if (val) {
      const selected = tasks.find(t => t.id === val);
      if (selected) {
        showToast(`Focus target set to "${selected.title}"`, 'success', null, null, 2000);
      }
    } else {
      showToast('Switched to General Focus', 'info', null, null, 1800);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentDuration = DURATIONS[mode];
  const progressPercent = Math.min(100, Math.max(0, Math.round(((currentDuration - timeLeft) / currentDuration) * 100)));

  // Determine display mode:
  // 1. Full timer is open: isVisible && !isMinimized
  // 2. Floating mini-timer popup: isMinimized || (!isVisible && isRunning)
  const isFullOpen = Boolean(isVisible) && !isMinimized;
  const isMiniOpen = isMinimized || (!isVisible && isRunning);

  if (!isFullOpen && !isMiniOpen) return null;

  // Render Small Attractive Floating Mini Timer Popup
  if (isMiniOpen && !isFullOpen) {
    const modeConfig = MODES.find(m => m.id === mode) || MODES[0];
    return (
      <div
        className="pomodoro-mini-widget pomodoro-mini-animated shadow-lg"
        role="region"
        aria-label="Floating Mini Pomodoro Timer"
      >
        {/* Status Mode Badge */}
        <div
          className={`pomo-mini-mode-badge ${mode}`}
          title={`${modeConfig.label} session`}
        >
          <span className="pomo-mini-icon">{modeConfig.icon}</span>
          <span className="pomo-mini-mode-text">{modeConfig.label}</span>
          {isRunning && <span className="pomo-mini-live-dot" />}
        </div>

        {/* Time Remaining - Clicking reopens full timer */}
        <div
          className="pomo-mini-time"
          onClick={handleReopen}
          title="Click to reopen full timer"
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleReopen(); }}
        >
          {formattedTime}
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-1">
          {/* Pause / Resume Button */}
          <button
            type="button"
            className={`pomo-mini-btn ${isRunning ? 'pomo-mini-btn-pause' : 'pomo-mini-btn-play'}`}
            onClick={toggleStartPause}
            title={isRunning ? 'Pause Timer' : 'Resume Timer'}
            aria-label={isRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            <i className={`bi ${isRunning ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
          </button>

          {/* Reopen / Expand Button */}
          <button
            type="button"
            className="pomo-mini-btn pomo-mini-btn-expand"
            onClick={handleReopen}
            title="Expand to Full Timer"
            aria-label="Expand to Full Timer"
          >
            <i className="bi bi-arrows-angle-expand"></i>
          </button>

          {/* Close Button */}
          <button
            type="button"
            className="pomo-mini-btn pomo-mini-btn-close"
            onClick={handleDismissMini}
            title="Close Timer"
            aria-label="Close Timer"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pomodoro-widget pomodoro-widget-animated"
      role="region"
      aria-label="Focus Pomodoro Timer"
    >
      {/* Sleek Header */}
      <div className="pomodoro-header">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '26px',
              height: '26px',
              background: mode === 'focus' ? 'rgba(239, 68, 68, 0.12)' : mode === 'shortBreak' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
              color: mode === 'focus' ? '#ef4444' : mode === 'shortBreak' ? '#10b981' : '#6366f1'
            }}
          >
            <i className="bi bi-stopwatch-fill fs-6"></i>
          </div>
          <span className="fw-bold small text-body" style={{ fontSize: '0.92rem' }}>
            Focus Pomodoro
          </span>
        </div>

        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="pomo-header-btn"
            title="Reset Timer"
            onClick={resetTimer}
            aria-label="Reset Timer"
          >
            <i className="bi bi-arrow-counterclockwise fs-6"></i>
          </button>
          <button
            type="button"
            className="pomo-header-btn"
            title="Minimize Timer"
            onClick={handleMinimize}
            aria-label="Minimize Timer"
          >
            <i className="bi bi-dash-lg"></i>
          </button>
          <button
            type="button"
            className="btn-close ms-1"
            style={{ fontSize: '0.7rem' }}
            aria-label="Close Pomodoro"
            onClick={handleClose}
          ></button>
        </div>
      </div>

      <div className="p-3 text-center">
        {/* Modern Segmented Pill Tabs */}
        <div className="pomo-tabs-pill-wrap mb-2" role="tablist">
          {MODES.map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`pomo-tab-btn ${isActive ? `active mode-${m.id}` : ''}`}
                onClick={() => switchMode(m.id)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clear, Beautiful Centered Countdown Timer */}
        <div className="pomo-timer-display">
          <div className={`pomo-digits ${isRunning ? 'is-running' : ''}`}>
            {formattedTime}
          </div>

          <div className={`pomo-status-chip ${isRunning ? 'running' : 'paused'}`}>
            {isRunning ? (
              <>
                <span className="pomo-pulse-dot" />
                <span>{mode === 'focus' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
              </>
            ) : (
              <span>Paused</span>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="pomo-progress-track">
          <div
            className="pomo-progress-bar"
            style={{
              width: `${progressPercent}%`,
              background:
                mode === 'focus'
                  ? 'linear-gradient(90deg, #f87171, #ef4444)'
                  : mode === 'shortBreak'
                  ? 'linear-gradient(90deg, #34d399, #10b981)'
                  : 'linear-gradient(90deg, #818cf8, #6366f1)'
            }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        {/* Redesigned Focus Target Card with generous spacing */}
        <div className="pomo-target-card mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1.5">
            <span className="pomo-target-label d-flex align-items-center gap-1">
              <i className="bi bi-crosshair text-primary"></i>
              FOCUS TARGET
            </span>
            {activePomodoroTask && (
              <span className="pomo-task-badge">
                🍅 {activePomodoroTask.pomodorosCompleted || 0} / {activePomodoroTask.pomodorosEstimated || 1}
              </span>
            )}
          </div>
          <select
            className="form-select form-select-sm pomo-target-select shadow-none"
            value={activePomodoroTaskId || ''}
            onChange={handleTargetChange}
            aria-label="Select Focus Target Task"
          >
            <option value="">-- General Focus (No task linked) --</option>
            {tasks.filter(t => !t.completed).map(t => (
              <option key={t.id} value={t.id}>
                {t.title.length > 30 ? t.title.substring(0, 30) + '...' : t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Properly Aligned Control Action Buttons */}
        <div className="d-flex justify-content-center gap-2 mb-2.5">
          <button
            type="button"
            className={`btn btn-sm pomo-btn-primary ${mode ? `mode-${mode}` : ''} ${isRunning ? 'pomo-btn-pause' : ''}`}
            onClick={toggleStartPause}
          >
            <i className={`bi ${isRunning ? 'bi-pause-fill' : 'bi-play-fill'} fs-6`}></i>
            <span>{isRunning ? 'Pause' : mode === 'focus' ? 'Start Focus' : 'Start Break'}</span>
          </button>

          <button
            type="button"
            className="btn btn-sm pomo-btn-secondary"
            onClick={resetTimer}
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Reset</span>
          </button>
        </div>

        {/* Bottom Session Counter Indicator */}
        <div className="pomo-footer">
          <span>Completed sessions:</span>
          <span className="fw-bold text-body">{sessionsCompleted}</span>
          <span>🍅</span>
        </div>
      </div>
    </div>
  );
};
