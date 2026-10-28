import { useState } from 'react';
import { useAuth } from '../context/useAuth';

export const AuthModal = ({ isOpen, onClose }) => {
  const { user, isGuest, handleGoogleSignIn, handleEmailLogin, handleEmailRegister, handleLogout, authError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await handleEmailRegister(email, password, displayName);
      } else {
        await handleEmailLogin(email, password);
      }
      onClose();
    } catch (err) {
      setFormError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleClick = async () => {
    setFormError('');
    setIsSubmitting(true);
    try {
      await handleGoogleSignIn();
      onClose();
    } catch (err) {
      setFormError(err.message || 'Google Sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block modal-animated-backdrop"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-animated-dialog"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header border-bottom">
            <h5 id="auth-modal-title" className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-person-circle text-primary"></i>
              {user && !isGuest ? 'Cloud Account Profile' : 'Sign in to Cloud Sync'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {user && !isGuest ? (
              <div className="text-center py-2">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3 fs-2 shadow-sm"
                  style={{ width: '64px', height: '64px' }}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="rounded-circle w-100 h-100" />
                  ) : (
                    <span>{user.displayName ? user.displayName[0].toUpperCase() : 'U'}</span>
                  )}
                </div>
                <h5 className="fw-bold mb-1">{user.displayName || 'Cloud User'}</h5>
                <p className="text-muted small mb-3">{user.email}</p>
                <div className="alert alert-success py-2 small d-flex align-items-center justify-content-center gap-2 mb-4">
                  <i className="bi bi-shield-check"></i>
                  <span>All tasks securely backed up to Firebase Cloud</span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 rounded-3 fw-semibold"
                  onClick={async () => {
                    await handleLogout();
                    onClose();
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                </button>
              </div>
            ) : (
              <div>
                {isGuest && (
                  <div className="alert alert-info py-2 small mb-3">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    You are currently using an <strong>Anonymous Guest session</strong>. Sign in with Google or Email to preserve tasks across all your devices.
                  </div>
                )}

                {(formError || authError) && (
                  <div className="alert alert-danger py-2 small mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    {formError || authError}
                  </div>
                )}

                {/* Google Sign In Button */}
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 py-2.5 mb-3 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm"
                  onClick={onGoogleClick}
                  disabled={isSubmitting}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="d-flex align-items-center my-3 text-secondary">
                  <hr className="flex-grow-1" />
                  <span className="px-2 small text-uppercase fw-semibold">or email</span>
                  <hr className="flex-grow-1" />
                </div>

                <form onSubmit={handleSubmit}>
                  {isRegister && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Alex Morgan"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        required={isRegister}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 rounded-3 fw-bold shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : isRegister ? 'Create Cloud Account' : 'Sign In with Email'}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none small"
                      onClick={() => {
                        setIsRegister(!isRegister);
                        setFormError('');
                      }}
                    >
                      {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
