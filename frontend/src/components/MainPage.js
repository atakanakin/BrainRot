import React, { useState } from "react";
import OnboardingVideoSection from "./OnboardingVideoSection";
import "../styles/MainPage.css";

// TODO: Replace with your video source
const videoSrc = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const sections = [
  {
    id: "section1",
    videoSrc,
    title: "First Section Title",
    body: "This is the body text for the first section.",
    reverse: false,
    backgroundColor: "#f5f5f5",
  },
  {
    id: "section2",
    videoSrc,
    title: "Second Section Title",
    body: "This is the body text for the second section.",
    reverse: true,
    backgroundColor: "#e3e3e3",
  },
  {
    id: "section3",
    videoSrc,
    title: "Third Section Title",
    body: "This is the body text for the third section.",
    reverse: false,
    backgroundColor: "#d1d1d1",
  },
];

const MainPage = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div>
      {sections.map((section, index) => (
        <OnboardingVideoSection
          key={section.id}
          id={section.id}
          videoSrc={section.videoSrc}
          title={section.title}
          body={section.body}
          reverse={section.reverse}
          backgroundColor={section.backgroundColor}
          nextSectionId={sections[index + 1]?.id}
          isMuted={isMuted}
          toggleMute={toggleMute}
        />
      ))}
    </div>
  );
};

export default MainPage;
