"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lessonMediaSyncClient } from "@/app/lessons/mediaSync/lessonMediaSyncClient";
import type {
  TMiniGameLiveState,
  TMiniGamePatch,
} from "../../editor/MiniGame/types";

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

const mergePatch = (prev: TMiniGameLiveState, patch: TMiniGamePatch) =>
  typeof patch === "function" ? patch(prev) : { ...prev, ...patch };

/**
 * Shared realtime mini-game state.
 * Outbound snapshots name the revision they were built on. A stale write is
 * rejected; unacked local edits are replayed onto the newer snapshot.
 */
export function useMiniGameLiveSync({ lessonId, exId, enabled }: TArgs) {
  const [state, setState] = useState<TMiniGameLiveState>({});
  const [version, setVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef<TMiniGameLiveState>({});
  const revisionRef = useRef(0);
  const pendingEchoRef = useRef(new Set<string>());
  const hydratedRef = useRef(false);
  const unackedRef = useRef<TMiniGamePatch[]>([]);
  const latestSendIdRef = useRef<string | null>(null);
  const sentCountRef = useRef(0);
  const rebasedOnRef = useRef(-1);
  const exIdRef = useRef(exId);
  exIdRef.current = exId;

  const applyState = useCallback((next: TMiniGameLiveState) => {
    stateRef.current = next;
    setState(next);
    setVersion((v) => v + 1);
  }, []);

  const sendSnapshot = useCallback((snapshot: TMiniGameLiveState) => {
    const clientEventId = newEventId();
    latestSendIdRef.current = clientEventId;
    sentCountRef.current = unackedRef.current.length;
    pendingEchoRef.current.add(clientEventId);
    const sent = lessonMediaSyncClient.sendMiniGame({
      exId: exIdRef.current,
      clientEventId,
      baseRevision: revisionRef.current,
      state: snapshot as Record<string, unknown>,
    });
    if (!sent) {
      pendingEchoRef.current.delete(clientEventId);
      latestSendIdRef.current = null;
      return false;
    }
    rebasedOnRef.current = revisionRef.current;
    return true;
  }, []);

  const rebaseOnto = useCallback(
    (raw: TMiniGameLiveState, revision: number) => {
      if (!unackedRef.current.length || rebasedOnRef.current === revision) {
        rebasedOnRef.current = revision;
        applyState(raw);
        return;
      }
      let next = raw;
      for (const patch of unackedRef.current) {
        next = mergePatch(next, patch);
      }
      rebasedOnRef.current = revision;
      applyState(next);
      latestSendIdRef.current = null;
      if (hydratedRef.current) {
        const ok = sendSnapshot(next);
        if (!ok) {
          hydratedRef.current = false;
          setHydrated(false);
        }
      }
    },
    [applyState, sendSnapshot],
  );

  useEffect(() => {
    hydratedRef.current = false;
    setHydrated(false);
    unackedRef.current = [];
    latestSendIdRef.current = null;
    sentCountRef.current = 0;
    rebasedOnRef.current = -1;
    revisionRef.current = 0;
    pendingEchoRef.current.clear();

    if (!enabled || !lessonId || !exId) {
      applyState({});
      return;
    }

    const cached = lessonMediaSyncClient.getLastMiniGame(exId);
    if (cached?.state && typeof cached.state === "object") {
      revisionRef.current = cached.revision;
      rebasedOnRef.current = cached.revision;
      applyState(cached.state as TMiniGameLiveState);
    } else {
      applyState({});
    }

    const unsub = lessonMediaSyncClient.subscribeMiniGame((detail) => {
      if (detail.exId !== exId) return;

      const isLatestEcho = detail.clientEventId === latestSendIdRef.current;
      if (pendingEchoRef.current.has(detail.clientEventId)) {
        pendingEchoRef.current.delete(detail.clientEventId);
        revisionRef.current = Math.max(revisionRef.current, detail.revision);
        if (!isLatestEcho) return;
        latestSendIdRef.current = null;
        rebasedOnRef.current = detail.revision;
        unackedRef.current.splice(0, sentCountRef.current);
        if (unackedRef.current.length && hydratedRef.current) {
          const ok = sendSnapshot(stateRef.current);
          if (!ok) {
            hydratedRef.current = false;
            setHydrated(false);
          }
        }
        return;
      }

      if (detail.revision <= revisionRef.current) return;
      revisionRef.current = detail.revision;
      const next =
        detail.state && typeof detail.state === "object"
          ? (detail.state as TMiniGameLiveState)
          : {};
      rebaseOnto(next, detail.revision);
    });

    const unsubReady = lessonMediaSyncClient.subscribeReady(() => {
      hydratedRef.current = true;
      setHydrated(true);
    });

    return () => {
      unsub();
      unsubReady();
    };
  }, [applyState, enabled, exId, lessonId, rebaseOnto, sendSnapshot]);

  useEffect(() => {
    if (!enabled || !hydrated || !unackedRef.current.length) return;
    if (latestSendIdRef.current) return;
    const ok = sendSnapshot(stateRef.current);
    if (!ok) {
      hydratedRef.current = false;
      setHydrated(false);
    }
  }, [enabled, hydrated, sendSnapshot]);

  const patchState = useCallback(
    (patch: TMiniGamePatch) => {
      if (!enabled) return;
      const prev = stateRef.current;
      const next = mergePatch(prev, patch);
      if (next === prev) return;
      applyState(next);
      unackedRef.current.push(patch);
      if (!hydratedRef.current || latestSendIdRef.current) return;
      const sent = sendSnapshot(next);
      if (!sent) {
        hydratedRef.current = false;
        setHydrated(false);
      }
    },
    [applyState, enabled, sendSnapshot],
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
