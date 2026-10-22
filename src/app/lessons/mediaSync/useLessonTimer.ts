"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lessonMediaSyncClient } from "./lessonMediaSyncClient";
import {
  IDLE_LESSON_TIMER,
  type TLessonTimerState,
} from "./types";

export function remainingMsFromState(
  state: TLessonTimerState,
  nowMs = Date.now(),
): number {
  if (state.status === "idle") return 0;
  if (state.status === "paused") {
    return Math.max(0, state.remainingMs ?? 0);
  }
  if (state.status === "finished") return 0;
  if (state.endsAtMs == null) return Math.max(0, state.remainingMs ?? 0);
  const serverNow = nowMs + state.clockOffsetMs;
  return Math.max(0, state.endsAtMs - serverNow);
}

export function formatTimerMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Distinct three-note “times up” chime (bright + short echo). */
const playTimerBeep = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);

    const notes = [
      { freq: 784, at: 0, dur: 0.16 }, // G5
      { freq: 988, at: 0.18, dur: 0.16 }, // B5
      { freq: 1175, at: 0.36, dur: 0.42 }, // D6 hold
    ];

    const now = ctx.currentTime;
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, now + note.at);
      gain.gain.setValueAtTime(0.0001, now + note.at);
      gain.gain.exponentialRampToValueAtTime(1, now + note.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + note.at + note.dur,
      );
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + note.at);
      osc.stop(now + note.at + note.dur + 0.02);

      // Soft overtone for sparkle
      const over = ctx.createOscillator();
      const overGain = ctx.createGain();
      over.type = "sine";
      over.frequency.setValueAtTime(note.freq * 2, now + note.at);
      overGain.gain.setValueAtTime(0.0001, now + note.at);
      overGain.gain.exponentialRampToValueAtTime(0.35, now + note.at + 0.02);
      overGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + note.at + note.dur * 0.85,
      );
      over.connect(overGain);
      overGain.connect(master);
      over.start(now + note.at);
      over.stop(now + note.at + note.dur);
    }

    window.setTimeout(() => {
      void ctx.close();
    }, 1200);
  } catch {
    /* ignore */
  }
};

export function useLessonTimer({
  enabled,
  isTeacher,
}: {
  enabled: boolean;
  isTeacher: boolean;
}) {
  const [state, setState] = useState<TLessonTimerState>(IDLE_LESSON_TIMER);
  const [remainingMs, setRemainingMs] = useState(0);
  const [finishedPulse, setFinishedPulse] = useState(false);
  const lastCommandIdRef = useRef(0);
  const finishedForCommandRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setState(IDLE_LESSON_TIMER);
      setRemainingMs(0);
      return;
    }
    return lessonMediaSyncClient.subscribeTimer((next) => {
      setState(next);
      setRemainingMs(remainingMsFromState(next));
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (state.status !== "running") {
      setRemainingMs(remainingMsFromState(state));
      return;
    }
    const tick = () => {
      const next = remainingMsFromState(state);
      setRemainingMs(next);
      if (next <= 0 && finishedForCommandRef.current !== state.commandId) {
        finishedForCommandRef.current = state.commandId;
        setFinishedPulse(true);
        playTimerBeep();
        window.setTimeout(() => setFinishedPulse(false), 2800);
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [enabled, state]);

  useEffect(() => {
    if (state.commandId && state.commandId !== lastCommandIdRef.current) {
      lastCommandIdRef.current = state.commandId;
      if (state.status === "finished") {
        if (finishedForCommandRef.current !== state.commandId) {
          finishedForCommandRef.current = state.commandId;
          setFinishedPulse(true);
          playTimerBeep();
          window.setTimeout(() => setFinishedPulse(false), 2800);
        }
      }
    }
  }, [state.commandId, state.status]);

  const start = useCallback(
    (durationSec: number) => {
      if (!isTeacher) return;
      lessonMediaSyncClient.startTimer(durationSec);
    },
    [isTeacher],
  );

  const pause = useCallback(() => {
    if (!isTeacher) return;
    lessonMediaSyncClient.pauseTimer();
  }, [isTeacher]);

  const resume = useCallback(() => {
    if (!isTeacher) return;
    lessonMediaSyncClient.resumeTimer();
  }, [isTeacher]);

  const reset = useCallback(() => {
    if (!isTeacher) return;
    lessonMediaSyncClient.resetTimer();
  }, [isTeacher]);

  const progress =
    state.durationSec > 0
      ? Math.min(1, Math.max(0, remainingMs / (state.durationSec * 1000)))
      : 0;

  return {
    state,
    remainingMs,
    display: formatTimerMmSs(remainingMs),
    progress,
    finishedPulse,
    isActive: state.status === "running" || state.status === "paused",
    isIdle: state.status === "idle",
    isTeacher,
    start,
    pause,
    resume,
    reset,
  };
}

export type TUseLessonTimer = ReturnType<typeof useLessonTimer>;
