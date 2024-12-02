import React, { useState } from "react";
import OnboardingVideoSection from "./OnboardingVideoSection";
import "../styles/MainPage.css";


const sections = [
  {
    id: "section0",
    videoSrc: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/minecraft_short.mp4",
    title: "First Section Title",
    body: "This is the body text for the first section.",
    reverse: false,
    backgroundColor: "#2A2A2A",
  },
  {
    id: "section1",
    videoSrc: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/subway_surfers_short.mp4",
    title: "Second Section Title",
    body: "This is the body text for the second section.",
    reverse: true,
    backgroundColor: "#202020",
  },
  {
    id: "section2",
    videoSrc: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/gta_short.mp4",
    title: "Third Section Title",
    body: "This is the body text for the third section.",
    reverse: false,
    backgroundColor: "#141414",
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
