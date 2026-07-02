"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGet } from "@/api";
import { useDebouncedCallback } from "use-debounce";
import { closeBoardSession, startBoardSession } from "../api/boardSession";
import { loadBoardDetail } from "../api/loadBoardContent";
import { BOARD_REALTIME_SAVE_DEBOUNCE_MS } from "../constants";
import {
  TBoard,
  TBoardSaveStatus,
  TBoardSnapshot,
  TBoardTeacherCursor,
} from "../types";
import {
  getBoardSnapshotFingerprint,
  snapshotToExcalidrawInitialData,
  type TExcalidrawInitialData,
} from "../utils/boardSnapshot";
import { multiplayerBoardSyncAdapter } from "../sync/MultiplayerBoardSyncAdapter";
import { isBoardTeacherParticipantId } from "../utils/boardTeacherCursor";

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
  const [board, setBoard] = useState<TBoard | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [contentRevision, setContentRevision] = useState(0);
  const [teacherCursor, setTeacherCursor] = useState<TBoardTeacherCursor | null>(
    null,
  );

  const versionRef = useRef(0);
  const lastSentFingerprintRef = useRef<string | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const isHostRef = useRef(isHost);
  const boardIdRef = useRef(boardId);
  const hasInitialSceneRef = useRef(false);
  const sessionClosedRef = useRef(false);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    boardIdRef.current = boardId;
  }, [boardId]);

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

    const status = {
      active: !!json.active,
      is_host: !!json.is_host,
      room_key: json.room_key,
      session: json.session || null,
    };
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
      sessionClosedRef.current = true;
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
  }, BOARD_REALTIME_SAVE_DEBOUNCE_MS);

  useEffect(() => {
    if (!enabled || !boardId) {
      multiplayerBoardSyncAdapter.disconnect();
      setInitialData(null);
      setBoard(null);
      setLoadError(false);
      setSaveStatus("idle");
      setTeacherCursor(null);
      versionRef.current = 0;
      lastSentFingerprintRef.current = null;
      hasInitialSceneRef.current = false;
      sessionClosedRef.current = false;
      return;
    }

    let disposed = false;
    sessionClosedRef.current = false;

    const connect = async () => {
      setSaveStatus("connecting");
      setLoadError(false);

      try {
        const detail = await loadBoardDetail(boardId);
        if (disposed) {
          return;
        }

        if (!detail) {
          setLoadError(true);
          setSaveStatus("error");
          return;
        }

        setBoard(detail.board);
        applyScene(detail.content.data, detail.content.version);
      } catch {
        if (!disposed) {
          setLoadError(true);
          setSaveStatus("error");
        }
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
      } else if (!disposed) {
        setSaveStatus(hasInitialSceneRef.current ? "connected" : "connecting");
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
        onSessionClosed: () => {
          if (!disposed && hasInitialSceneRef.current) {
            setSaveStatus("connected");
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
        onCursor: ({ from, username, pointer, button }) => {
          if (isHostRef.current || !isBoardTeacherParticipantId(from)) {
            return;
          }
          setTeacherCursor({
            id: from,
            username: username || "Учитель",
            x: pointer.x,
            y: pointer.y,
            tool: pointer.tool === "laser" ? "laser" : "pointer",
            button: button === "down" ? "down" : "up",
          });
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
      if (
        !sessionClosedRef.current &&
        boardIdRef.current &&
        isHostRef.current
      ) {
        void closeBoardSession(boardIdRef.current).catch(() => {});
      }
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

  const queueSave = useCallback(
    (snapshot: TBoardSnapshot) => {
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
    board,
    loadError,
    contentRevision,
    teacherCursor,
    queueSave,
    flushSave,
    leaveSession,
  };
};
