"use client";

import { CSSProperties, useEffect, useState } from "react";

type TSticker = {
  emoji: string;
  left: number;
  scale: number;
  sway: number;
  delay: number;
  duration: number;
};

const EMOJIS = ["🎁", "🎉", "🔥", "😍", "✨", "🏆"];

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createStickers = (count: number): TSticker[] =>
  Array.from({ length: count }, () => ({
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    left: random(0, 100),
    scale: random(0.4, 1),
    sway: random(1, 5),
    delay: random(0, 0.4),
    duration: random(0.9, 1.8),
  }));

type TProps = {
  trigger: number;
};

/** Imperative burst when `trigger` increments (e.g. after win). */
export const StickerBurst = ({ trigger }: TProps) => {
  const [stickers, setStickers] = useState<TSticker[] | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = window.matchMedia("(min-width: 1024px)").matches ? 42 : 24;
    const burst = createStickers(count);
    setStickers(burst);
    const lastFrame = Math.max(...burst.map((s) => s.delay + s.duration));
    const timer = window.setTimeout(
      () => setStickers(null),
      lastFrame * 1000 + 200,
    );
    return () => window.clearTimeout(timer);
  }, [trigger]);

  if (!stickers) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 select-none overflow-hidden text-[72px] leading-none lg:text-[140px]"
      aria-hidden
    >
      {stickers.map((sticker, index) => (
        <span
          key={`${trigger}-${index}`}
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
