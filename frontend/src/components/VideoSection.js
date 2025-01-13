import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { FaRegPauseCircle, FaRegPlayCircle } from "react-icons/fa";
import "../styles/VideoSection.css";
import { API_URL } from "../constants/Url";
import { WebVTT } from "vtt.js";

const videos = {
  "Minecraft": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/minecraft_short.mp4",
  "Subway Surfers": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/subway_surfers_short.mp4",
  "GTA5": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/gta_short.mp4",
  "Satisfying": "https://gitlab.com/atakanakin/shortvideos/-/raw/main/satisfy_short.mp4",
};

const VideoSection = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [currentVideo, setCurrentVideo] = useState(Object.values(videos)[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [subtitleSrc, setSubtitleSrc] = useState(null);
  const [subtitleText, setSubtitleText] = useState("");
  const [isSubtitleError, setIsSubtitleError] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const subtitleCues = useRef([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subtitle handling
  useEffect(() => {
    if (subtitleSrc) {
      fetch(subtitleSrc, {
        method: "GET",
        mode: "cors",
        credentials: 'include',
      })
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

  // Audio time update handling
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

  useImperativeHandle(ref, () => ({
    handleInternalWorkflowComplete: async (audioFile, subtitleFile) => {
        try {
        const audioResponse = await fetch(`${API_URL}/file/${audioFile}`, {
            method: "GET",
            credentials: 'include'
        });
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const subtitleSrc = `${API_URL}/file/${subtitleFile}`;
        setAudioSrc(audioUrl);
        setSubtitleSrc(subtitleSrc);
        setIsPlaying(true);
        videoRef.current.play();
        if (audioRef.current) {
            audioRef.current.crossOrigin = "use-credentials";
            audioRef.current.play();
        }
        } catch (error) {
        console.error("Error loading media:", error);
        setIsSubtitleError(true);
        }
    }
  }));

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
    setIsLoading(true);
    setCurrentVideo(videos[key]);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play();
  };

  return (
    <div className="video-section">
      <div className="video-wrapper" onClick={handleVideoClick}>
      {isLoading && (
          <div className="video-placeholder">
            <div className="loading-spinner"></div>
          </div>
        )}
        <video
          ref={videoRef}
          src={currentVideo}
          onLoadedData={() => setIsLoading(false)}
          onEnded={() => {
            setIsPlaying(true);
            videoRef.current.play();
            if (audioRef.current) audioRef.current.play();
          }}
          autoPlay
          playsInline
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
            className={`slider-button ${currentVideo === videos[key] ? "active" : ""}`}
            onClick={() => handleVideoChange(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
});

export default VideoSection;