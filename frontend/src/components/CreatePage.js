import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/CreatePage.css";
import { FaRegPauseCircle, FaRegPlayCircle } from "react-icons/fa";
import UploadSection from "./UploadSection";

const videos = {
  "Minecraft": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/minecraft_short.mp4",
  "Subway Surfers": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/subway_surfers_short.mp4",
  "GTA5": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/gta_short.mp4",
  "Satisfying": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/satisfy_short.mp4",
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
          <UploadSection />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;