"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lessonMediaSyncClient } from "@/app/lessons/mediaSync/lessonMediaSyncClient";
import type { TMiniGameLiveState } from "../../editor/MiniGame/types";

const newEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

type TArgs = {
  lessonId: number;
  exId: number;
  enabled: boolean;
};

/**
 * Shared realtime mini-game state over the lesson media WebSocket.
 * Anyone can publish; LWW by server revision. Own echoes ignored via client_event_id.
 */
export function useMiniGameLiveSync({ lessonId, exId, enabled }: TArgs) {
  const [state, setState] = useState<TMiniGameLiveState>({});
  const [version, setVersion] = useState(0);
  const stateRef = useRef<TMiniGameLiveState>({});
  const revisionRef = useRef(0);
  const pendingEchoRef = useRef(new Set<string>());

  const applyState = useCallback((next: TMiniGameLiveState) => {
    stateRef.current = next;
    setState(next);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !lessonId || !exId) {
      revisionRef.current = 0;
      pendingEchoRef.current.clear();
      applyState({});
      return;
    }

    revisionRef.current = 0;
    pendingEchoRef.current.clear();

    const cached = lessonMediaSyncClient.getLastMiniGame(exId);
    if (cached) {
      revisionRef.current = cached.revision;
      applyState(
        cached.state && typeof cached.state === "object"
          ? (cached.state as TMiniGameLiveState)
          : {},
      );
    } else {
      applyState({});
    }

    const unsub = lessonMediaSyncClient.subscribeMiniGame((detail) => {
      if (detail.exId !== exId) return;

      if (pendingEchoRef.current.has(detail.clientEventId)) {
        pendingEchoRef.current.delete(detail.clientEventId);
        revisionRef.current = Math.max(revisionRef.current, detail.revision);
        return;
      }

      if (detail.revision <= revisionRef.current) return;
      revisionRef.current = detail.revision;
      const next =
        detail.state && typeof detail.state === "object"
          ? (detail.state as TMiniGameLiveState)
          : {};
      applyState(next);
    });

    return () => {
      unsub();
    };
  }, [applyState, enabled, exId, lessonId]);

  const patchState = useCallback(
    (
      patch:
        | Partial<TMiniGameLiveState>
        | ((prev: TMiniGameLiveState) => TMiniGameLiveState),
    ) => {
      if (!enabled) return;
      const prev = stateRef.current;
      const next =
        typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      applyState(next);

      const clientEventId = newEventId();
      pendingEchoRef.current.add(clientEventId);
      const sent = lessonMediaSyncClient.sendMiniGame({
        exId,
        clientEventId,
        state: next as Record<string, unknown>,
      });
      if (!sent) {
        window.setTimeout(() => {
          pendingEchoRef.current.delete(clientEventId);
        }, 8000);
      }
    },
    [applyState, enabled, exId],
  );

  return {
    isLive: enabled,
    state,
    stateRef,
    version,
    patchState,
    applyState,
  };
}
