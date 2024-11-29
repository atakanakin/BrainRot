import React from "react";
import { FaTwitter, FaCoffee, FaGithub, FaLinkedin } from "react-icons/fa";
import { mail, twitter, buyMeaCoffee, github, linkedin } from "../constants/SocialMedia";
import "../styles/Footer.css";

const Footer = () => {
    return (
        <footer>
            <p><a href={mail} className="mail-link">contact@atakanakin.com.tr</a></p>
            <p>&copy; 2024 Ali Atakan Akın</p>
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
        </footer>
    );
};

export default Footer;