import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { FaRegPauseCircle, FaRegPlayCircle } from "react-icons/fa";
import "../styles/VideoSection.css";
import { API_URL } from "../constants/Url";
import { WebVTT } from "vtt.js";

const VideoSection = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState({});
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
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

    // Fetch videos.json dynamically
    useEffect(() => {
      const fetchVideos = async () => {
        try {
          const response = await fetch("/videos.json");
          const data = await response.json();
          setVideos(data);
          const firstCategory = Object.keys(data)[0];
          setCurrentCategory(firstCategory);
          setCurrentVideo(data[firstCategory][0]);
        } catch (error) {
          console.error("Error fetching videos.json:", error);
        }
      };
  
      fetchVideos();
    }, []);

  const getRandomVideo = (category) => {
    const videoList = videos[category];
    const randomIndex = Math.floor(Math.random() * videoList.length);
    return videoList[randomIndex];
  };

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
      const currentTime = audioElement.currentTime;
      const currentCue = subtitleCues.current.find(
        (cue) => cue.startTime <= currentTime && cue.endTime >= currentTime
      );
      setSubtitleText(currentCue ? currentCue.text : "");
    };

    const audioElement = audioRef.current; // Capture the current value of audioRef.current

    if (audioElement) {
      audioElement.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [audioSrc]); // Keep the dependency on audioSrc

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

  const handleVideoChange = (category) => {
    setIsLoading(true);
    const randomVideo = getRandomVideo(category);
    setCurrentCategory(category);
    setCurrentVideo(randomVideo);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play();
  };

  return (
    <div className="video-section">
      <div className="video-wrapper" onClick={handleVideoClick}>
      {isLoading && (
          <div className="video-placeholder">
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
        {Object.keys(videos).map((category, index) => (
          <button
            key={index}
            className={`slider-button ${currentCategory === category ? "active" : ""}`}
            onClick={() => handleVideoChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
});

export default VideoSection;