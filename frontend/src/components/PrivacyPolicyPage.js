// src/components/PrivacyPolicyPage.js
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
    const { t } = useTranslation();
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const header = document.querySelector("header");
        if (header) {
            setHeaderHeight(header.offsetHeight + 20);
        }
    }, []);

    return (
        <div className="privacy-container" style={{
            paddingTop: `${headerHeight}px`,
            paddingBottom: "20px",
        }}>
            <div className="privacy-content">
                <h1>{t('privacy.title', 'Privacy Policy')}</h1>
                <p>{t('privacy.intro', 'Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our app.')}</p>
                
                <h2>{t('privacy.collection_title', 'Information We Collect')}</h2>
                <ul>
                    <li>{t('privacy.collection_google', 'Google Account information (e.g., name, email) upon your consent during Google Sign-In.')}</li>
                    <li>{t('privacy.collection_usage', 'Activity logs and usage data to improve our services.')}</li>
                </ul>

                <h2>{t('privacy.usage_title', 'How We Use Your Information')}</h2>
                <p>{t('privacy.usage_intro', 'We use your information to:')}</p>
                <ul>
                    <li>{t('privacy.usage_access', 'Provide you with access to the app\'s features.')}</li>
                    <li>{t('privacy.usage_experience', 'Enhance user experience and support.')}</li>
                    <li>{t('privacy.usage_updates', 'Communicate important updates.')}</li>
                </ul>

                <h2>{t('privacy.protection_title', 'Data Protection')}</h2>
                <p>{t('privacy.protection_text', 'We implement robust measures to protect your data and ensure compliance with applicable regulations.')}</p>

                <h2>{t('privacy.contact_title', 'Contact Us')}</h2>
                <p>{t('privacy.contact_text', 'If you have any questions about this policy, contact us at contact@atakanakin.com.tr')}</p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;