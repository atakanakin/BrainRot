import React, { useState, useEffect, useRef } from "react";
import "../styles/CreatePage.css";
import VideoSection from "./VideoSection";
import UploadSection from "./UploadSection";

const CreatePage = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const videoSectionRef = useRef(null);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight + 20);
    }
  }, []);

  const handleWorkflowComplete = (audioFile, subtitleFile) => {
    // Pass to VideoSection's internal handler through ref or callback
    if (videoSectionRef.current) {
      videoSectionRef.current.handleInternalWorkflowComplete(audioFile, subtitleFile);
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
        <VideoSection ref={videoSectionRef} />
        <div className="upload-section">
          <UploadSection onWorkflowComplete={handleWorkflowComplete} />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;