import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import '../i18n';
import '../styles/Header.css';
import { FaHeart, FaPlus } from "react-icons/fa";
import logo from '../assets/brainrot_logo.svg';
import { buyMeaCoffee } from "../constants/SocialMedia";

const Header = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header>
            <div className="logo-title" onClick={() => navigate("/")}>
                <img src={logo} alt="Logo" />
                <h1 style={{ margin: 0 }}>{t('app_name')}</h1>
            </div>
            <div className="buttons">
                <button onClick={() =>
                    window.open(buyMeaCoffee, "_blank")
                } className="create-button">
                    <FaHeart className="heart-icon" />
                    {t('sponsor')}
                </button>
                {location.pathname !== "/create" && (
                    <button onClick={() => navigate("/create")} className="create-button">
                        <FaPlus className="plus-icon" />
                        {t('create')}
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;