// LoginPage.js
import React, {useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';
import { API_URL } from '../constants/Url';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
      const header = document.querySelector("header");
      if (header) {
          setHeaderHeight(header.offsetHeight + 20);
      }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/google-login`;
  };

  if (loading) {
    return <div className="login-container"
    style={{
      paddingTop: `${headerHeight}px`,
      paddingBottom: "20px",
  }}
  >
      <div className="login-box">
        <h1>{t('common.loading', 'Loading...')}</h1>
      </div>
    </div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-container"
    style={{
      paddingTop: `${headerHeight}px`,
      paddingBottom: "20px",
  }}>
      <div className="login-box">
        <h1>{t('login.welcome', 'Welcome')}</h1>
            <p>{t('login.description', 'Please sign in to continue')}</p>
            <button onClick={handleGoogleLogin} className="google-login-button">
              <img src="data:image/png;base64,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" alt="Google" className="google-icon" />
              {t('login.google_signin', 'Sign in with Google')}
            </button>
          </div>
      </div>
  );
};