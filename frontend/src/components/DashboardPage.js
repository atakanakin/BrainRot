// DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
    const { t } = useTranslation();
    const { user, loading, logout, checkAuthStatus } = useAuth();
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const header = document.querySelector("header");
        if (header) {
            setHeaderHeight(header.offsetHeight + 20);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const refreshAuth = async () => {
            if (mounted) {
                await checkAuthStatus();
            }
        };

        refreshAuth();

        return () => {
            mounted = false;
        };
    }, []);


    if (loading) {
        return (
            <div className="dashboard-container"
                style={{
                    paddingTop: `${headerHeight}px`,
                    paddingBottom: "20px",
                }}>
                <h1>{t('common.loading', 'Loading...')}</h1>
            </div>
        );
    }

    return (
        <div className="dashboard-container"
            style={{
                paddingTop: `${headerHeight}px`,
                paddingBottom: "20px",
            }}>
            <div className="dashboard-header">
                {/* <h1>{t('dashboard.title', 'Dashboard')}</h1> */}
            </div>

            <div className="dashboard-grid">
                {/* User Profile Section */}
                <div className="dashboard-card profile-card">
                    {/* <h2>{t('dashboard.profile', 'Profile')}</h2> */}
                    <div className="profile-info">
                        <img
                            src={user?.picture || "data:image/png;base64,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"}
                            alt="Profile"
                            className="profile-avatar"
                        />
                        <div className="profile-details">
                            <h3>{user?.name}</h3>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Token Usage Section */}
                <div className="dashboard-card usage-card">
                    <h2>{t('dashboard.tokens', 'Token Usage')}</h2>
                    <div className="token-info">
                        <div className="token-stat">
                            <span className="token-number">{user?.remaining_tokens}</span>
                            <span className="token-label">{t('dashboard.remaining', 'Remaining')}</span>
                        </div>
                    </div>
                </div>

                {/* Subscription Section */}
                <div className="dashboard-card subscription-card">
                    {user?.is_premium ? (
                        <>
                            <h2>{t('dashboard.premium', 'Premium Subscription')}</h2>
                            <p>{t('dashboard.premium_description', 'You have a premium subscription')}</p>
                        </>
                    ) : (
                        <>
                            <h2>{t('dashboard.free', 'Free Subscription')}</h2>
                            <p>{t('dashboard.free_description', 'You have a free subscription')}</p>
                            <button 
                onClick={() => alert(t('dashboard.premium_features', 
                    'Coming soon! Premium features will be available soon!'))}
                className="premium-button"
            >
                {t('dashboard.unlock_premium', 'Unlock Premium')}
            </button>
                        </>
                    )}
                </div>

                {/* Quick Actions Section */}
                <div className="dashboard-card actions-card">
                    <h2>{t('dashboard.actions', 'Quick Actions')}</h2>
                    <div className="action-buttons">
                        <button onClick={() => window.location.href = '/#/create'}>
                            {t('dashboard.create_new', 'Create New')}
                        </button>
                        <button
                            onClick={async () => {
                                await logout();
                                window.location.href = '/#/';
                            }}
                            className="logout-button"
                        >
                            {t('dashboard.logout', 'Logout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;