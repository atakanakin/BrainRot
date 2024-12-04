import React, { useState } from "react";
import OnboardingVideoSection from "./OnboardingVideoSection";
import "../styles/MainPage.css";
import { useTranslation } from "react-i18next";

const sections = [
  {
    id: "section0",
    videoSrc: "section_0_video",
    title: "section_0_title",
    body: "section_0_body",
    reverse: false,
    backgroundColor: "#2A2A2A",
  },
  {
    id: "section1",
    videoSrc: "section_1_video",
    title: "section_1_title",
    body: "section_1_body",
    reverse: true,
    backgroundColor: "#202020",
  },
  {
    id: "section2",
    videoSrc: "section_2_video",
    title: "section_2_title",
    body: "section_2_body",
    reverse: false,
    backgroundColor: "#141414",
  },
];

const MainPage = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };
  const { t } = useTranslation();

  return (
    <div>
      {sections.map((section, index) => (
        <OnboardingVideoSection
          key={section.id}
          id={section.id}
          videoSrc={t(section.videoSrc)}
          title={t(section.title)}
          body={t(section.body)}
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
