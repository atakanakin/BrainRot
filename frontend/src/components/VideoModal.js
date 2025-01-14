import React, { useRef, useEffect } from 'react';
import VideoSection from './VideoSection';
import { FaTimes } from 'react-icons/fa';
import '../styles/VideoModal.css';

const VideoModal = ({ isOpen, onClose,filename }) => {
  const videoSectionRef = useRef(null);
  useEffect(() => {
    if (isOpen && filename && videoSectionRef.current) {
      videoSectionRef.current.handleInternalWorkflowComplete(
        filename + ".mp3",
        filename + ".vtt"
      );
    }
  }, [isOpen, filename]);
  
  if (!isOpen) return null;

  return (
    <div className="video-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="video-modal-content">
        <button className="video-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <VideoSection ref={videoSectionRef} />
      </div>
    </div>
  );
};

export default VideoModal;