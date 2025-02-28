import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaCoffee, FaGithub, FaLinkedin } from "react-icons/fa";
import { mail, twitter, buyMeaCoffee, github, linkedin } from "../constants/SocialMedia";
import "../styles/Footer.css";

const Footer = () => {
    return (
        <footer>
            <p><a href={mail} className="mail-link">contact@atakanakin.com.tr</a></p>
            <div className="copyright-container">
                <p>&copy; 2024 Ali Atakan Akın</p>
                <Link to="/privacy-policy" className="privacy-link">Privacy Policy</Link>
            </div>
            <div className="social-icons">
                <a href={github} target="_blank" rel="noopener noreferrer">
                    <FaGithub className="github" />
                </a>
                <a href={buyMeaCoffee} target="_blank" rel="noopener noreferrer">
                    <FaCoffee className="coffee" />
                </a>
                <a href={twitter} target="_blank" rel="noopener noreferrer">
                    <FaTwitter className="twitter" />
                </a>
                <a href={linkedin} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className="linkedin" />
                </a>
            </div>
            <div className="scout-forge-badge">
                <a
                    href="https://scoutforge.net/reviews/brainrot/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Trusted and reviewed by Scout Forge"
                >
                    <img
                        src="https://scoutforge.net/wp-content/themes/wp-theme/assets/img/badges/badge-dark.webp"
                        alt="Trusted and Reviewed by Scout Forge"
                    />
                </a>
            </div>
        </footer>
    );
};

export default Footer;