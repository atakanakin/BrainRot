import React, { useState } from "react";
import OnboardingVideoSection from "./OnboardingVideoSection";
import "../styles/MainPage.css";


const sections = [
  {
    id: "section0",
    videoSrc: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_1.mp4",
    title: "A Fun Solution to Your Study Struggles",
    body: "Have you ever wanted to scroll through TikTok for hours, but those exams just won’t let you breathe? We get it, studying can feel like a chore when all you want is a break. That’s where BrainRot comes in. With BrainRot, you don’t have to choose between grinding for your grades and enjoying your favorite pastime. We’ve cracked the code to turn studying into something you actually look forward to. Your course materials meet a whole new level of creativity—now, it’s not just work; it’s fun!",
    reverse: false,
    backgroundColor: "#2A2A2A",
  },
  {
    id: "section1",
    videoSrc: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_2.mp4",
    title: "Study Smarter, Not Boring-er",
    body: "I know it sounds too good to be true, but trust me: with BrainRot, studying can finally be fun. Here’s how it works: BrainRot’s powerful AI takes your course material, turns it into a voiceover, and matches it with gameplay from viral, endlessly watchable videos—just like the ones that keep you glued to your feed. Imagine prepping for your finals while being entertained by your favorite game highlights. No more zoning out; no more dragging your feet. BrainRot keeps you engaged, entertained, and ready to crush those exams like a boss.",
    reverse: true,
    backgroundColor: "#202020",
  },
  {
    id: "section2",
    videoSrc: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_3.mp4",
    title: "Your Personalized Study Adventure",
    body: "And here’s the best part: when this video ends, you’ll be redirected to the Create Page; your personal BrainRot command center. Upload your course material—PDFs, Word docs, PowerPoint slides, or even simple text files—and watch BrainRot work its magic. In just seconds, you’ll have a custom study video ready to go. It’s fast, it’s fun, and it’s made just for you. So what are you waiting for? Let’s make studying something you can’t wait to do. Click through and give BrainRot a try—you won’t regret it!",
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
