"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playTimerBeep,
  remainingMsFromState,
  formatTimerMmSs,
} from "@/app/lessons/mediaSync/useLessonTimer";
import {
  IDLE_LESSON_TIMER,
  type TLessonTimerState,
} from "@/app/lessons/mediaSync/types";
import { multiplayerBoardSyncAdapter } from "../sync/MultiplayerBoardSyncAdapter";

const nextCommandId = (current: number) => current + 1;

const buildState = (
  patch: Pick<TLessonTimerState, "status" | "durationSec" | "endsAtMs" | "remainingMs"> & {
    commandId: number;
  },
): TLessonTimerState => {
  const now = Date.now();
  return {
    ...patch,
    updatedAtMs: now,
    serverTimeMs: now,
    clockOffsetMs: 0,
  };
};

/**
 * Countdown for a board that is not attached to a lesson.
 * The host drives it. People on the same board receive the state over the
 * board socket; solo editing keeps it on this screen only.
 */
export function useBoardTimer({
  enabled,
  isTeacher,
}: {
  enabled: boolean;
  isTeacher: boolean;
}) {
  const [state, setState] = useState<TLessonTimerState>(IDLE_LESSON_TIMER);
  const [remainingMs, setRemainingMs] = useState(0);
  const [finishedPulse, setFinishedPulse] = useState(false);
  const stateRef = useRef(state);
  const finishedForCommandRef = useRef(0);
  stateRef.current = state;

  const publish = useCallback((next: TLessonTimerState) => {
    setState(next);
    multiplayerBoardSyncAdapter.sendTimer(next);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState(IDLE_LESSON_TIMER);
      setRemainingMs(0);
      return;
    }
    return multiplayerBoardSyncAdapter.subscribeTimer((remote) => {
      const local = stateRef.current;
      if (remote.commandId < local.commandId) return;
      if (
        remote.commandId === local.commandId &&
        remote.updatedAtMs < local.updatedAtMs
      ) {
        return;
      }
      setState(remote);
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

  const start = useCallback(
    (durationSec: number) => {
      if (!isTeacher) return;
      const now = Date.now();
      publish(
        buildState({
          commandId: nextCommandId(stateRef.current.commandId),
          status: "running",
          durationSec,
          endsAtMs: now + durationSec * 1000,
          remainingMs: durationSec * 1000,
        }),
      );
    },
    [isTeacher, publish],
  );

  const pause = useCallback(() => {
    if (!isTeacher) return;
    const current = stateRef.current;
    if (current.status !== "running") return;
    publish(
      buildState({
        commandId: current.commandId,
        status: "paused",
        durationSec: current.durationSec,
        endsAtMs: null,
        remainingMs: remainingMsFromState(current),
      }),
    );
  }, [isTeacher, publish]);

  const resume = useCallback(() => {
    if (!isTeacher) return;
    const current = stateRef.current;
    if (current.status !== "paused") return;
    const remaining = Math.max(0, current.remainingMs ?? 0);
    publish(
      buildState({
        commandId: current.commandId,
        status: "running",
        durationSec: current.durationSec,
        endsAtMs: Date.now() + remaining,
        remainingMs: remaining,
      }),
    );
  }, [isTeacher, publish]);

  const reset = useCallback(() => {
    if (!isTeacher) return;
    publish(
      buildState({
        commandId: nextCommandId(stateRef.current.commandId),
        status: "idle",
        durationSec: 0,
        endsAtMs: null,
        remainingMs: null,
      }),
    );
  }, [isTeacher, publish]);

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
