"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import LogoFlame from "@/assets/icons/logo_flame.svg";
import FlameBlack from "@/assets/icons/logo_anim/flame_black.svg";
import StickerThree from "@/assets/icons/logo_anim/three.svg";
import StickerE from "@/assets/icons/logo_anim/e.svg";
import StickerA from "@/assets/icons/logo_anim/a.svg";
import StickerS from "@/assets/icons/logo_anim/s.svg";
import StickerY from "@/assets/icons/logo_anim/y.svg";

type TProps = {
  className?: string;
};

// Sticker boxes in em, one per letter of "2easy" (the "2" turns into a "3").
const STICKERS = [
  { src: StickerThree, left: 0.0476, top: 0.0707, width: 0.7733, height: 1.0232 },
  { src: StickerE, left: 0.503, top: 0.1406, width: 0.8709, height: 0.9529 },
  { src: StickerA, left: 1.1036, top: 0.1394, width: 0.8084, height: 0.8865 },
  { src: StickerS, left: 1.5746, top: 0.1898, width: 0.8475, height: 0.9256 },
  { src: StickerY, left: 2.1612, top: 0.1808, width: 0.8357, height: 1.0466 },
];

const STEP_MS = 300;
const START_DELAY_MS = 600;

// All sizes are in em: font-size of the root sets the logo scale (43.2px = 150px wide).
export const Logo = ({ className = "" }: TProps) => {
  const [step, setStep] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  const play = useCallback(() => {
    if (timers.current.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    STICKERS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i), i * STEP_MS));
    });
    timers.current.push(
      window.setTimeout(() => {
        setStep(null);
        timers.current = [];
      }, STICKERS.length * STEP_MS),
    );
  }, []);

  useEffect(() => {
    const startTimer = window.setTimeout(play, START_DELAY_MS);
    return () => {
      window.clearTimeout(startTimer);
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [play]);

  const fade = {
    transition: `opacity ${step === 0 ? 300 : 100}ms ease-out`,
  };
  const letterStyle = (i: number) => ({ ...fade, opacity: step === i ? 0 : 1 });

  return (
    <span
      className={`relative inline-block h-[1.2302em] w-[3.4718em] shrink-0 leading-none text-[rgba(17,24,28,0.94)] ${className}`}
      aria-label="2easy"
      onMouseEnter={play}
    >
      <span
        className="absolute left-[0.1718em] top-[-0.0555em] flex items-baseline font-bold tracking-brand"
        aria-hidden
      >
        <span className="text-[0.775em] font-extrabold" style={letterStyle(0)}>
          2
        </span>
        <span>
          {"easy".split("").map((letter, i) => (
            <span key={letter} style={letterStyle(i + 1)}>
              {letter}
            </span>
          ))}
        </span>
      </span>
      <Image
        src={FlameBlack}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[2.8642em] top-[0.2355em] h-[0.6038em] w-[0.4327em] max-w-none"
        style={{ ...fade, opacity: step === null ? 0 : 1 }}
      />
      <Image
        src={LogoFlame}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[2.7143em] top-[0.1606em] h-[0.9034em] w-[0.7326em] max-w-none"
        style={{ ...fade, opacity: step === null ? 1 : 0 }}
      />
      {STICKERS.map(({ src, left, top, width, height }, i) => (
        <Image
          key={src.src}
          src={src}
          alt=""
          aria-hidden
          className="pointer-events-none absolute max-w-none"
          style={{
            ...fade,
            left: `${left}em`,
            top: `${top}em`,
            width: `${width}em`,
            height: `${height}em`,
            opacity: step === i ? 1 : 0,
          }}
        />
      ))}
    </span>
  );
};
