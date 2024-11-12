"use client";

import React, { RefObject, useEffect } from "react";
  
interface VideoComponentProps {
  videoContainerRef: RefObject<HTMLDivElement>;
  audioRef: RefObject<HTMLAudioElement>;
}

const VideoComponent: React.FC<VideoComponentProps> = ({
  videoContainerRef,
  audioRef,
}) => {

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const videos =
            videoContainerRef.current?.getElementsByTagName("video");
          if (videos && videos.length > 1) {
            // Keep only the most recently added video
            Array.from(videos)
              .slice(0, -1)
              .forEach((video) => {
                video.pause();
                video.srcObject = null;
                video.remove();
              });
          }
        }
      });
    });

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [videoContainerRef]);

  return (

    <div id="videoContainer" ref={videoContainerRef} className="relative overflow-hidden">
      <audio id="audioRef" ref={audioRef} className="hidden" />
    </div>
  );
};

export default VideoComponent;

