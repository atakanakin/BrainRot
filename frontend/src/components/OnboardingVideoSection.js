import React, { useRef, useEffect, useState } from "react";
import { scroller } from "react-scroll";
import { useNavigate } from "react-router-dom";
import "../styles/OnboardingVideoSection.css";
import { FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

const OnboardingVideoSection = ({
  id,
  videoSrc,
  title,
  body,
  reverse,
  backgroundColor,
  nextSectionId,
  isMuted,
  toggleMute,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoplayed, setHasAutoplayed] = useState(false);
  const navigate = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            if (!hasAutoplayed) {
              videoRef.current.play();
              setIsPlaying(true);
              setHasAutoplayed(true);
            }
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasAutoplayed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (nextSectionId) {
      scroller.scrollTo(nextSectionId, {
        duration: 800,
        delay: 0,
        smooth: "easeInOutQuart",
      });
    } else {
      navigate("/create");
      window.scrollTo(0, 0);
    }
  };

  return (
    <div
      id={id}
      className={`onboarding-video-section ${reverse ? "reverse" : ""}`}
      style={{
        backgroundColor: backgroundColor,
        paddingTop: id === "section0" ? "100px" : "20px",
      }}
    >
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          playsInline
          muted={isMuted}
          onEnded={handleVideoEnd}
          className="video-element"
        />
        <div className="video-controls">
          <button onClick={togglePlayPause} className="control-button">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={toggleMute} className="control-button">
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        </div>
      </div>
      <div className="text-container">
        <h2 className="section-title">{title}</h2>
        <p className="section-body">{body}</p>
      </div>
    </div>
  );
};

export default OnboardingVideoSection;
