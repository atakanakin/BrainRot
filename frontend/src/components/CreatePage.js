import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/CreatePage.css";
import { FaRegPauseCircle, FaRegPlayCircle } from "react-icons/fa";

const videos = {
  "Subway Surfers": "https://www.w3schools.com/html/mov_bbb.mp4", // TODO: Replace with your video sources
  "Minecraft": "https://www.w3schools.com/html/movie.mp4",
  "Satisfying": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "GTA5": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
};

const CreatePage = () => {
  const { t } = useTranslation();
  const [currentVideo, setCurrentVideo] = useState(Object.values(videos)[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const videoRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight + 20);
    }
  }, []);

  const handleVideoClick = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    setShowIndicator(true);
    setTimeout(() => setShowIndicator(false), 800);
  };

  const handleVideoChange = (key) => {
    setCurrentVideo(videos[key]);
    setIsPlaying(true);
  };

  const handleUpload = () => {
    alert(t("upload_placeholder")); // TODO: Implement upload functionality
  };

  return (
    <div
      className="create-page"
      style={{
        paddingTop: `${headerHeight}px`,
        paddingBottom: "20px",
      }}
    >
      <div className="split-container">
        {/* Video Section */}
        <div className="video-section">
          <div className="video-wrapper" onClick={handleVideoClick}>
            <video
              ref={videoRef}
              src={currentVideo}
              onEnded={() => videoRef.current.play()}
              autoPlay
              muted
              className="video-element"
            />
            {showIndicator && (
              <div className="play-pause-indicator">
                {isPlaying ? <FaRegPlayCircle /> : <FaRegPauseCircle />}
              </div>
            )}
          </div>
          <div className="slider">
            {Object.keys(videos).map((key, index) => (
              <button
                key={index}
                className={`slider-button ${
                  currentVideo === videos[key] ? "active" : ""
                }`}
                onClick={() => handleVideoChange(key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <h2>{t("upload_title")}</h2>
          <p>{t("upload_description")}</p>
          <button onClick={handleUpload} className="upload-btn">
            {t("upload_button")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;