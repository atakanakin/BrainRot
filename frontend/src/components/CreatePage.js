import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/CreatePage.css";
import { FaRegPauseCircle, FaRegPlayCircle } from "react-icons/fa";
import UploadSection from "./UploadSection";
import { WebVTT } from "vtt.js";

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
  const [audioSrc, setAudioSrc] = useState(null);
  const [subtitleSrc, setSubtitleSrc] = useState(null)
  const [subtitleText, setSubtitleText] = useState("");
  const [isSubtitleError, setIsSubtitleError] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const subtitleCues = useRef([]);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight + 20);
    }
  }, []);

  useEffect(() => {
    if (subtitleSrc) {
      fetch(subtitleSrc)
        .then(response => response.text())
        .then(vttText => {
          const parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
          parser.oncue = cue => {
            subtitleCues.current.push(cue);
          };
          parser.parse(vttText);
          parser.flush();
        })
        .catch(error => {
          console.error("Error loading subtitles:", error);
          setIsSubtitleError(true);
        });
    }
  }, [subtitleSrc]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const currentCue = subtitleCues.current.find(
          cue => cue.startTime <= currentTime && cue.endTime >= currentTime
        );
        setSubtitleText(currentCue ? currentCue.text : "");
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [audioSrc]);

  const handleVideoClick = () => {
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
    } else {
      videoRef.current.play();
      if (audioRef.current) audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
    setShowIndicator(true);
    setTimeout(() => setShowIndicator(false), 800);
  };

  const handleVideoChange = (key) => {
    setCurrentVideo(videos[key]);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play();
  };

  const handleWorkflowComplete = async (audioFile, subtitleFile) => {
    try {
      const audioUrl = `http://localhost:5000/file/${audioFile}`;
      const subtitleSrc = `http://localhost:5000/file/${subtitleFile}`;
      setAudioSrc(audioUrl);
      setSubtitleSrc(subtitleSrc)
      setIsPlaying(true);
      videoRef.current.play();
      if (audioRef.current) audioRef.current.play();
    } catch (error) {
      console.error("Error loading subtitles:", error);
      setIsSubtitleError(true);
    }
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
              onEnded={() => {
                setIsPlaying(true);
                videoRef.current.play();
                if (audioRef.current) audioRef.current.play();
              }}
              autoPlay
              className="video-element"
            />
            {audioSrc && (
              <audio
                ref={audioRef}
                src={audioSrc}
                autoPlay
                loop
                style={{ display: "none" }}
              />
            )}
            {showIndicator && (
              <div className="play-pause-indicator">
                {isPlaying ? <FaRegPlayCircle /> : <FaRegPauseCircle />}
              </div>
            )}
            <div className="subtitle">{subtitleText}</div>
          </div>
          {isSubtitleError && (
            <p className="error-message">{t("subtitle_load_error")}</p>
          )}
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
          <UploadSection onWorkflowComplete={handleWorkflowComplete} />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;