"use client";
import { CSSProperties, RefObject, useEffect, useState } from "react";

type TSticker = {
  emoji: string;
  left: number;
  scale: number;
  sway: number;
  delay: number;
  duration: number;
};

type TProps = {
  targetRef: RefObject<HTMLElement>;
};

const EMOJIS = ["🔥", "😍"];

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createStickers = (count: number): TSticker[] =>
  Array.from({ length: count }, () => ({
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    left: random(0, 100),
    scale: random(0.4, 1),
    sway: random(1, 5),
    delay: random(0, 1.25),
    duration: random(0.9, 1.8),
  }));

// One-off burst of stickers floating up the screen when the target scrolls into view.
export const StickerRain = ({ targetRef }: TProps) => {
  const [stickers, setStickers] = useState<TSticker[] | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const count = window.matchMedia("(min-width: 1024px)").matches ? 50 : 28;
        const burst = createStickers(count);
        setStickers(burst);
        const lastFrame = Math.max(...burst.map((s) => s.delay + s.duration));
        timer = window.setTimeout(() => setStickers(null), lastFrame * 1000 + 200);
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [targetRef]);

  if (!stickers) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 select-none overflow-hidden text-[72px] leading-none lg:text-[150px]"
      aria-hidden
    >
      {stickers.map((sticker, index) => (
        <span
          key={index}
          className="absolute top-0 -ml-[0.5em] block animate-sticker-rise"
          style={
            {
              left: `${sticker.left}%`,
              fontSize: `${sticker.scale}em`,
              "--rise-delay": `${sticker.delay}s`,
              "--rise-duration": `${sticker.duration}s`,
            } as CSSProperties
          }
        >
          <span
            className="block animate-sticker-sway"
            style={{ "--sway": `${sticker.sway}deg` } as CSSProperties}
          >
            {sticker.emoji}
          </span>
        </span>
      ))}
    </div>
  );
};
