import React, { useRef, useEffect, useState } from "react";
import { scroller } from "react-scroll";

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!hasAutoplayed) {
              videoRef.current.play();
              setIsPlaying(true);
              setHasAutoplayed(true);
            }
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
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
    }
  };

  return (
    <div
      id={id}
      style={{
        display: "flex",
        flexDirection: reverse ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: backgroundColor,
        padding: "50px",
        minHeight: "100vh",
      }}
    >
      <div style={{ position: "relative", width: "40%" }}>
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          onEnded={handleVideoEnd}
          style={{
            width: "100%",
            maxHeight: "80vh",
            objectFit: "cover",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={togglePlayPause}
            style={{
              padding: "10px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={toggleMute}
            style={{
              padding: "10px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>
      <div
        style={{
          width: "50%",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "2em" }}>{title}</h2>
        <p style={{ fontSize: "1.2em", lineHeight: "1.6" }}>{body}</p>
      </div>
    </div>
  );
};

export default OnboardingVideoSection;
