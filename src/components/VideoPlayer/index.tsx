"use client";

import {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  PointerEvent as ReactPointerEvent,
} from "react";

type TProps = {
  src: string;
  title?: string;
  className?: string;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const IconPlay = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
);

const IconPause = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const IconVolume = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const IconVolumeMute = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
    <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.4 8.4 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18V21h2.06a8.6 8.6 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const IconFullscreen = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

export const VideoPlayer: FC<TProps> = ({ src, title, className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHideControls = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 2500);
  }, []);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    return () => clearHideTimer();
  }, []);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.load();
    }
  }, [src]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  }, []);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const bar = progressRef.current;
      const v = videoRef.current;
      if (!bar || !v || !Number.isFinite(v.duration) || v.duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      v.currentTime = ratio * v.duration;
      setCurrent(v.currentTime);
    },
    [],
  );

  const onProgressPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSeeking(true);
    seekFromClientX(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onProgressPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!seeking) return;
    seekFromClientX(e.clientX);
  };

  const onProgressPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!seeking) return;
    setSeeking(false);
    seekFromClientX(e.clientX);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const onVolumeChange = (value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = value;
    v.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleFullscreen = async () => {
    const wrap = videoRef.current?.parentElement;
    if (!wrap) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await wrap.requestFullscreen?.();
    }
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-[#1a1530] group ${className || ""}`}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (playing) setShowControls(false);
      }}
      onFocus={revealControls}
    >
      <video
        ref={videoRef}
        src={src}
        className="block w-full max-h-[min(70vh,560px)] bg-black cursor-pointer"
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          scheduleHideControls();
        }}
        onPause={() => {
          setPlaying(false);
          setShowControls(true);
          clearHideTimer();
        }}
        onTimeUpdate={() => {
          if (!seeking && videoRef.current) {
            setCurrent(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration || 0);
        }}
        onEnded={() => {
          setPlaying(false);
          setShowControls(true);
        }}
        aria-label={title || "Video"}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity"
          aria-label="Play"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3F28C6] text-white shadow-lg shadow-[#3F28C6]/40 hover:bg-[#4f38d6] transition-colors">
            <IconPlay />
          </span>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1530]/95 via-[#1a1530]/70 to-transparent px-3 pb-3 pt-10 transition-opacity duration-200 ${
          showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          ref={progressRef}
          className="group/bar relative h-2 w-full cursor-pointer rounded-full bg-white/25 mb-3 touch-none"
          onPointerDown={onProgressPointerDown}
          onPointerMove={onProgressPointerMove}
          onPointerUp={onProgressPointerUp}
          onPointerCancel={() => setSeeking(false)}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(current)}
          aria-label="Seek"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#3F28C6]"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#FF7EB3] shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, opacity: seeking ? 1 : undefined }}
          />
        </div>

        <div className="flex items-center gap-2 text-white">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3F28C6] hover:bg-[#4f38d6] transition-colors"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>

          <span className="text-xs sm:text-sm tabular-nums text-white/90 min-w-[72px]">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center text-white/90 hover:text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? <IconVolumeMute /> : <IconVolume />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="video-player-volume w-16 sm:w-20 accent-[#3F28C6]"
              aria-label="Volume"
            />
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center text-white/90 hover:text-white"
              aria-label="Fullscreen"
            >
              <IconFullscreen />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
