"use client";
import { useEffect, useRef } from "react";

type TProps = {
  src: string;
  poster?: string;
  className?: string;
  /** Set to false to keep the clip paused, e.g. while its panel is hidden. */
  playing?: boolean;
};

// Muted looping clip that only plays while on screen.
export const LoopVideo = ({
  src,
  poster,
  className = "",
  playing = true,
}: TProps) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (
      !playing ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      video.pause();
      return;
    }
    video.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [playing]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      className={`pointer-events-none ${className}`}
    />
  );
};
