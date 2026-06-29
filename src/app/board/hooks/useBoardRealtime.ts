"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGet } from "@/api";
import { useDebouncedCallback } from "use-debounce";
import { closeBoardSession, startBoardSession } from "../api/boardSession";
import { loadBoardContent } from "../api/loadBoardContent";
import { BOARD_SAVE_DEBOUNCE_MS } from "../constants";
import {
  TBoardSaveStatus,
  TBoardSessionStatus,
  TBoardSnapshot,
  TBoardWsParticipant,
} from "../types";
import {
  getBoardSnapshotFingerprint,
  snapshotToExcalidrawInitialData,
} from "../utils/boardSnapshot";
import { multiplayerBoardSyncAdapter } from "../sync/MultiplayerBoardSyncAdapter";

type TExcalidrawInitialData = ReturnType<typeof snapshotToExcalidrawInitialData>;

type TUseBoardRealtimeParams = {
  boardId?: number;
  enabled?: boolean;
  isHost?: boolean;
};

export const useBoardRealtime = ({
  boardId,
  enabled = false,
  isHost = false,
}: TUseBoardRealtimeParams) => {
  const [saveStatus, setSaveStatus] = useState<TBoardSaveStatus>("idle");
  const [initialData, setInitialData] = useState<TExcalidrawInitialData | null>(
    null,
  );
  const [contentRevision, setContentRevision] = useState(0);
  const [participants, setParticipants] = useState<TBoardWsParticipant[]>([]);
  const [sessionStatus, setSessionStatus] = useState<TBoardSessionStatus | null>(
    null,
  );

  const versionRef = useRef(0);
  const lastSentFingerprintRef = useRef<string | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const isHostRef = useRef(isHost);
  const boardIdRef = useRef(boardId);
  const hasInitialSceneRef = useRef(false);
  const saveStatusRef = useRef<TBoardSaveStatus>("idle");

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    boardIdRef.current = boardId;
  }, [boardId]);

  useEffect(() => {
    saveStatusRef.current = saveStatus;
  }, [saveStatus]);

  const applyScene = useCallback((data: TBoardSnapshot, version: number) => {
    versionRef.current = version;
    lastSentFingerprintRef.current = getBoardSnapshotFingerprint(data);
    hasInitialSceneRef.current = true;
    setInitialData(snapshotToExcalidrawInitialData(data));
    setContentRevision((value) => value + 1);
  }, []);

  const loadSessionStatus = useCallback(async () => {
    const currentBoardId = boardIdRef.current;
    if (!currentBoardId) {
      return null;
    }

    const res = await fetchGet({
      path: `/board/session/status?board_id=${currentBoardId}`,
      isSecure: true,
    });
    const json = await res?.json();
    if (!json?.success) {
      return null;
    }

    const status: TBoardSessionStatus = {
      active: !!json.active,
      waiting_for_host: !!json.waiting_for_host,
      is_host: !!json.is_host,
      room_key: json.room_key,
      session: json.session || null,
    };
    setSessionStatus(status);
    return status;
  }, []);

  const startHostSession = useCallback(async () => {
    const currentBoardId = boardIdRef.current;
    if (!currentBoardId) {
      return null;
    }

    const res = await startBoardSession(currentBoardId);
    await loadSessionStatus();
    return res.session;
  }, [loadSessionStatus]);

  const closeHostSession = useCallback(async () => {
    const currentBoardId = boardIdRef.current;
    if (!currentBoardId || !isHostRef.current) {
      return;
    }

    try {
      await closeBoardSession(currentBoardId);
      await loadSessionStatus();
    } catch {
      // ignore close errors on unmount
    }
  }, [loadSessionStatus]);

  const debouncedSendScene = useDebouncedCallback((snapshot: TBoardSnapshot) => {
    const currentBoardId = boardIdRef.current;
    if (!currentBoardId || isRemoteUpdateRef.current) {
      return;
    }

    const fingerprint = getBoardSnapshotFingerprint(snapshot);
    if (fingerprint === lastSentFingerprintRef.current) {
      return;
    }

    lastSentFingerprintRef.current = fingerprint;
    versionRef.current += 1;
    setSaveStatus("saving");
    multiplayerBoardSyncAdapter.sendScene(
      currentBoardId,
      snapshot,
      versionRef.current,
    );
    setSaveStatus("connected");
  }, BOARD_SAVE_DEBOUNCE_MS);

  useEffect(() => {
    if (!enabled || !boardId) {
      multiplayerBoardSyncAdapter.disconnect();
      setInitialData(null);
      setSaveStatus("idle");
      setParticipants([]);
      setSessionStatus(null);
      versionRef.current = 0;
      lastSentFingerprintRef.current = null;
      hasInitialSceneRef.current = false;
      return;
    }

    let disposed = false;

    const connect = async () => {
      setSaveStatus("connecting");

      try {
        const content = await loadBoardContent(boardId);
        if (!disposed && content) {
          applyScene(content.data, content.version);
        }
      } catch {
        // REST fallback is best-effort; WS may still deliver the scene.
      }

      const status = await loadSessionStatus();
      if (disposed) {
        return;
      }

      if (isHostRef.current) {
        if (!status?.active) {
          await startHostSession();
        }
        if (!disposed) {
          setSaveStatus(hasInitialSceneRef.current ? "connected" : "connecting");
        }
      } else if (!status?.active) {
        setSaveStatus("waiting_for_host");
      }

      await multiplayerBoardSyncAdapter.connect(boardId, {
        onConnectionChange: (connected) => {
          if (!connected || disposed) {
            return;
          }
          if (isHostRef.current && hasInitialSceneRef.current) {
            setSaveStatus("connected");
          }
        },
        onWaitingForHost: () => {
          if (!isHostRef.current) {
            setSaveStatus("waiting_for_host");
          }
        },
        onSessionClosed: () => {
          if (!isHostRef.current) {
            setSaveStatus("waiting_for_host");
          }
        },
        onJoined: ({ scene, version }) => {
          if (disposed) {
            return;
          }
          isRemoteUpdateRef.current = true;
          applyScene(scene, version);
          setSaveStatus("connected");
          isRemoteUpdateRef.current = false;
        },
        onScene: ({ data, version }) => {
          if (disposed) {
            return;
          }
          isRemoteUpdateRef.current = true;
          applyScene(data, version);
          setSaveStatus("connected");
          isRemoteUpdateRef.current = false;
        },
        onParticipants: (list) => {
          setParticipants((list || []) as TBoardWsParticipant[]);
        },
        onSessionStarted: () => {
          if (disposed || isHostRef.current) {
            return;
          }
          setSaveStatus("connecting");
          multiplayerBoardSyncAdapter.requestJoin();
        },
        onError: () => {
          if (!disposed && !hasInitialSceneRef.current) {
            setSaveStatus("error");
          }
        },
      });

      if (!disposed) {
        multiplayerBoardSyncAdapter.requestJoin();
      }
    };

    void connect();

    return () => {
      disposed = true;
      debouncedSendScene.flush();
      multiplayerBoardSyncAdapter.disconnect();
    };
  }, [
    applyScene,
    boardId,
    debouncedSendScene,
    enabled,
    isHost,
    loadSessionStatus,
    startHostSession,
  ]);

  useEffect(() => {
    return () => {
      const currentBoardId = boardIdRef.current;
      if (currentBoardId && isHostRef.current) {
        void closeBoardSession(currentBoardId).catch(() => {});
      }
    };
  }, []);

  const queueSave = useCallback(
    (snapshot: TBoardSnapshot) => {
      if (saveStatusRef.current === "waiting_for_host") {
        return;
      }
      debouncedSendScene(snapshot);
    },
    [debouncedSendScene],
  );

  const flushSave = useCallback(async () => {
    debouncedSendScene.flush();
  }, [debouncedSendScene]);

  const leaveSession = useCallback(async () => {
    debouncedSendScene.flush();
    await closeHostSession();
    multiplayerBoardSyncAdapter.disconnect();
  }, [closeHostSession, debouncedSendScene]);

  return {
    saveStatus,
    initialData,
    contentRevision,
    participants,
    sessionStatus,
    isLoading: saveStatus === "connecting" && initialData === null,
    isWaitingForHost: saveStatus === "waiting_for_host",
    queueSave,
    flushSave,
    leaveSession,
    reloadSessionStatus: loadSessionStatus,
    startHostSession,
    closeHostSession,
  };
};
