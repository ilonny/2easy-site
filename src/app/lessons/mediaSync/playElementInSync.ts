"use client";

import type { TLessonMediaPlayDetail } from "./types";
import { syncedPositionSec } from "./publishLessonMediaPlay";

const waitForMetadata = (el: HTMLMediaElement, timeoutMs: number) =>
  new Promise<void>((resolve) => {
    if (el.readyState >= 1) {
      resolve();
      return;
    }
    let timer = 0;
    const finish = () => {
      window.clearTimeout(timer);
      el.removeEventListener("loadedmetadata", finish);
      resolve();
    };
    timer = window.setTimeout(finish, timeoutMs);
    el.addEventListener("loadedmetadata", finish);
  });

const seekTo = (el: HTMLMediaElement, target: number) => {
  const duration = el.duration;
  const clamped =
    Number.isFinite(duration) && duration > 0.3
      ? Math.min(target, Math.max(0, duration - 0.15))
      : target;
  try {
    if (Math.abs((el.currentTime || 0) - clamped) > 0.05) {
      el.currentTime = clamped;
    }
  } catch {
    /* seek can fail before metadata or without CORS */
  }
};

let pendingSound: HTMLMediaElement | null = null;
let soundResumeArmed = false;

const resumeBlockedSound = () => {
  const el = pendingSound;
  pendingSound = null;
  soundResumeArmed = false;
  window.removeEventListener("pointerdown", resumeBlockedSound, true);
  window.removeEventListener("keydown", resumeBlockedSound, true);
  if (!el) return;
  el.muted = false;
  void el.play().catch(() => {
    el.muted = true;
    void el.play().catch(() => undefined);
  });
};

const armSoundResume = (el: HTMLMediaElement) => {
  pendingSound = el;
  if (soundResumeArmed) return;
  soundResumeArmed = true;
  window.addEventListener("pointerdown", resumeBlockedSound, true);
  window.addEventListener("keydown", resumeBlockedSound, true);
};

const disarmSoundResume = (el: HTMLMediaElement) => {
  if (pendingSound !== el) return;
  pendingSound = null;
  if (!soundResumeArmed) return;
  soundResumeArmed = false;
  window.removeEventListener("pointerdown", resumeBlockedSound, true);
  window.removeEventListener("keydown", resumeBlockedSound, true);
};

const playNow = async (el: HTMLMediaElement) => {
  const withSound = !el.muted;
  try {
    await el.play();
    if (withSound) disarmSoundResume(el);
    return true;
  } catch {
    /* autoplay with sound can be rejected without a gesture */
  }
  if (!withSound) return false;
  el.muted = true;
  try {
    await el.play();
  } catch {
    el.muted = false;
    return false;
  }
  el.muted = false;
  if (!el.paused) {
    disarmSoundResume(el);
    return true;
  }
  el.muted = true;
  try {
    await el.play();
  } catch {
    armSoundResume(el);
    return false;
  }
  armSoundResume(el);
  return true;
};

export const pauseOtherMedia = (except: HTMLMediaElement | null) => {
  document.querySelectorAll("audio, video").forEach((node) => {
    const media = node as HTMLMediaElement;
    if (media !== except && !media.paused) {
      media.pause();
    }
  });
};

export async function playElementInSync(
  el: HTMLMediaElement,
  detail: TLessonMediaPlayDetail,
  isCurrent: () => boolean,
): Promise<"played" | "blocked" | "cancelled"> {
  const startedAt = Date.now();
  let played = false;
  while (isCurrent() && Date.now() - startedAt < 3000) {
    if (el.readyState >= 1) seekTo(el, syncedPositionSec(detail));
    if (el.paused) played = await playNow(el);
    else played = true;
    if (played && !el.paused) break;
    await new Promise((resolve) => window.setTimeout(resolve, 150));
  }
  if (!isCurrent()) {
    disarmSoundResume(el);
    el.pause();
    return "cancelled";
  }
  if (!played && el.paused) {
    armSoundResume(el);
    return "blocked";
  }
  if (el.readyState >= 1) {
    seekTo(el, syncedPositionSec(detail));
  } else {
    const onMeta = () => {
      el.removeEventListener("loadedmetadata", onMeta);
      if (isCurrent()) seekTo(el, syncedPositionSec(detail));
    };
    el.addEventListener("loadedmetadata", onMeta);
  }
  return "played";
}

export async function pauseElementInSync(
  el: HTMLMediaElement,
  detail: TLessonMediaPlayDetail,
  isCurrent: () => boolean,
): Promise<"paused" | "cancelled"> {
  await waitForMetadata(el, 8000);
  if (!isCurrent()) return "cancelled";
  disarmSoundResume(el);
  el.pause();
  seekTo(el, Math.max(0, detail.positionSec));
  if (!el.paused) el.pause();
  return "paused";
}

export const restartIfEnded = (el: HTMLMediaElement) => {
  const duration = el.duration;
  if (
    el.ended ||
    (Number.isFinite(duration) && duration > 0 && el.currentTime >= duration - 0.3)
  ) {
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  }
};
