import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import '../i18n';
import '../styles/Header.css';
import { FaHeart, FaPlus, FaUser, FaBars, FaTimes } from "react-icons/fa";
import logo from '../assets/brainrot_logo.svg';
import { useAuth } from '../context/AuthContext';
import { buyMeaCoffee } from "../constants/SocialMedia";

const Header = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false); // State to toggle dropdown menu

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState); // Toggle menu open/close
    };

    return (
        <header>
            <div className="logo-title" onClick={() => navigate("/")}>
                <img src={logo} alt="Logo" />
                <h1 style={{ margin: 0 }}>{t('app_name')}</h1>
            </div>
            <div className="menu-icon" onClick={toggleMenu}>
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
            <div className={`buttons ${menuOpen ? 'open' : ''}`}>
                <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="lang-select"
                >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                </select>
                <button
                    onClick={() => window.open(buyMeaCoffee, "_blank")}
                    className="create-button"
                >
                    <FaHeart className="heart-icon" />
                    {t('sponsor')}
                </button>
                {location.pathname !== "/create" && (
                    <button onClick={() => navigate("/create")} className="create-button">
                        <FaPlus className="plus-icon" />
                        {t('create')}
                    </button>
                )}
                {location.pathname !== "/dashboard" && location.pathname !== '/login' && (
                    user ? (
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="profile-button"
                        >
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                            ) : (
                                <FaUser className="user-icon" />
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="sign-in-button"
                        >
                            <FaUser className="user-icon" />
                            {t('login.signin', 'Sign In')}
                        </button>
                    )
                )}
            </div>
        </header>
    );
};

export default Header;