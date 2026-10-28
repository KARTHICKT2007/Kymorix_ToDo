import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextDef';
import {
  subscribeToAuth,
  signInGoogle,
  loginWithEmail,
  registerWithEmail,
  logOut
} from '../firebase/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const testUser = localStorage.getItem('kymorix_test_user');
      return testUser ? JSON.parse(testUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('kymorix_test_user');
    } catch {
      return true;
    }
  });
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user?.uid?.startsWith('test-')) {
      return;
    }

    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setAuthError(null);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setAuthError(null);
      const res = await signInGoogle();
      return res.user;
    } catch (err) {
      console.error('Google Sign-in error:', err);
      setAuthError(err.message || 'Google sign-in was closed or blocked');
      throw err;
    }
  }, []);

  const handleEmailLogin = useCallback(async (email, password) => {
    try {
      setAuthError(null);
      const res = await loginWithEmail(email, password);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const handleEmailRegister = useCallback(async (email, password, name) => {
    try {
      setAuthError(null);
      const res = await registerWithEmail(email, password, name);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logOut();
      setUser(null);
    } catch (err) {
      setAuthError(err.message);
    }
  }, []);

  const isGuest = Boolean(user && user.isAnonymous);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        authError,
        setAuthError,
        handleGoogleSignIn,
        handleEmailLogin,
        handleEmailRegister,
        handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
