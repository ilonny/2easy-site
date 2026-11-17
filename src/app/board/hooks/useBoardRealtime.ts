"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGet } from "@/api";
import { useDebouncedCallback } from "use-debounce";
import { closeBoardSession, startBoardSession } from "../api/boardSession";
import { loadBoardDetail } from "../api/loadBoardContent";
import { BOARD_REALTIME_SAVE_DEBOUNCE_MS } from "../constants";
import {
  TBoard,
  TBoardCursor,
  TBoardParticipant,
  TBoardSaveStatus,
  TBoardSnapshot,
} from "../types";
import {
  getBoardSnapshotFingerprint,
  snapshotToExcalidrawInitialData,
  type TExcalidrawInitialData,
} from "../utils/boardSnapshot";
import { multiplayerBoardSyncAdapter } from "../sync/MultiplayerBoardSyncAdapter";
import { publishBoardProgress } from "../utils/boardOpenProgress";
import {
  resetBoardFileStore,
  snapshotForRealtime,
  snapshotForSave,
  stashAndStripSnapshot,
} from "../utils/boardFileStore";
import { saveBoardDetail } from "../api/loadBoardContent";

type TUseBoardRealtimeParams = {
  boardId?: number;
  enabled?: boolean;
  isHost?: boolean;
  autoStartHostSession?: boolean;
  closeSessionOnUnmount?: boolean;
};

export const useBoardRealtime = ({
  boardId,
  enabled = false,
  isHost = false,
  autoStartHostSession = true,
  closeSessionOnUnmount = true,
}: TUseBoardRealtimeParams) => {
  const [saveStatus, setSaveStatus] = useState<TBoardSaveStatus>("idle");
  const [initialData, setInitialData] = useState<TExcalidrawInitialData | null>(
    null,
  );
  const [board, setBoard] = useState<TBoard | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [contentRevision, setContentRevision] = useState(0);
  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const [cursors, setCursors] = useState<TBoardCursor[]>([]);
  const [participants, setParticipants] = useState<TBoardParticipant[]>([]);

  const versionRef = useRef(0);
  const versionReadyRef = useRef(false);
  const filesOmittedRef = useRef(false);
  const pendingSnapshotRef = useRef<TBoardSnapshot | null>(null);
  const lastSentFingerprintRef = useRef<string | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const isHostRef = useRef(isHost);
  const boardIdRef = useRef(boardId);
  const hasInitialSceneRef = useRef(false);
  const sessionClosedRef = useRef(false);
  const autoStartHostSessionRef = useRef(autoStartHostSession);
  const closeSessionOnUnmountRef = useRef(closeSessionOnUnmount);

  useEffect(() => {
    autoStartHostSessionRef.current = autoStartHostSession;
  }, [autoStartHostSession]);

  useEffect(() => {
    closeSessionOnUnmountRef.current = closeSessionOnUnmount;
  }, [closeSessionOnUnmount]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    boardIdRef.current = boardId;
  }, [boardId]);

  const applyScene = useCallback((data: TBoardSnapshot, version: number, filesOmitted?: boolean) => {
    if (filesOmitted) filesOmittedRef.current = true;
    versionRef.current = version;
    versionReadyRef.current = true;
    const currentBoardId = boardIdRef.current || 0;
    const lite = currentBoardId ? stashAndStripSnapshot(currentBoardId, data) : data;
    lastSentFingerprintRef.current = getBoardSnapshotFingerprint(lite);
    hasInitialSceneRef.current = true;
    setInitialData(snapshotToExcalidrawInitialData(lite));
    setContentRevision((value) => value + 1);
    setLoadProgress(100);
    publishBoardProgress(100, "ready");
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
    if (!versionReadyRef.current) {
      pendingSnapshotRef.current = snapshot;
      return;
    }

    const fingerprint = getBoardSnapshotFingerprint(snapshot);
    if (fingerprint === lastSentFingerprintRef.current) {
      pendingSnapshotRef.current = null;
      return;
    }

    const prepared = snapshotForRealtime(
      currentBoardId,
      snapshot,
      filesOmittedRef.current,
    );
    pendingSnapshotRef.current = snapshot;

    void (async () => {
      if (!prepared.complete) {
        const saved = await saveBoardDetail(
          currentBoardId,
          snapshotForSave(currentBoardId, snapshot),
          versionRef.current,
        ).catch(() => null);
        if (saved?.json?.success) {
          versionRef.current = Number(saved.json.version || versionRef.current);
          lastSentFingerprintRef.current = fingerprint;
          setSaveStatus("connected");
        }
        return;
      }

      lastSentFingerprintRef.current = fingerprint;
      versionRef.current += 1;
      setSaveStatus("saving");
      multiplayerBoardSyncAdapter.sendScene(
        currentBoardId,
        prepared.snapshot,
        versionRef.current,
      );
      setSaveStatus("connected");
      pendingSnapshotRef.current = null;
    })();
  }, BOARD_REALTIME_SAVE_DEBOUNCE_MS);

  useEffect(() => {
    if (!enabled || !boardId) {
      multiplayerBoardSyncAdapter.disconnect();
      setInitialData(null);
      setBoard(null);
      setLoadError(false);
      setSaveStatus("idle");
      setLoadProgress(null);
      setCursors([]);
      setParticipants([]);
      versionRef.current = 0;
      versionReadyRef.current = false;
      filesOmittedRef.current = false;
      pendingSnapshotRef.current = null;
      lastSentFingerprintRef.current = null;
      if (boardId) resetBoardFileStore(boardId);
      hasInitialSceneRef.current = false;
      sessionClosedRef.current = false;
      return;
    }

    let disposed = false;
    sessionClosedRef.current = false;

    const connect = async () => {
      setSaveStatus("connecting");
      setLoadError(false);
      setLoadProgress(0);
      versionReadyRef.current = false;
      filesOmittedRef.current = false;
      resetBoardFileStore(boardId);
      publishBoardProgress(0, "download");

      try {
        await loadBoardDetail(boardId, {
          onProgress: (progress) => {
            if (!disposed) setLoadProgress(progress);
          },
          onBoard: (nextBoard) => {
            if (!disposed) setBoard(nextBoard);
          },
          onScene: (snapshot) => {
            if (disposed) return;
            const lite = stashAndStripSnapshot(boardId, snapshot);
            lastSentFingerprintRef.current = getBoardSnapshotFingerprint(lite);
            hasInitialSceneRef.current = true;
            setInitialData(snapshotToExcalidrawInitialData(lite));
            setContentRevision((value) => value + 1);
            setLoadProgress(100);
            setSaveStatus("connected");
          },
          onDone: ({ version, filesOmitted }) => {
            if (disposed) return;
            versionRef.current = version;
            versionReadyRef.current = true;
            if (filesOmitted) filesOmittedRef.current = true;
            const pending = pendingSnapshotRef.current;
            if (pending) debouncedSendScene(pending);
          },
        });
        if (disposed) {
          return;
        }
      } catch {
        if (!disposed) {
          setLoadError(true);
          setSaveStatus("error");
          publishBoardProgress(null, "error");
        }
      }

      const status = await loadSessionStatus();
      if (disposed) {
        return;
      }

      if (isHostRef.current && hasInitialSceneRef.current) {
        if (!status?.active && autoStartHostSessionRef.current) {
          try {
            await startHostSession();
          } catch {
            if (!disposed) setSaveStatus("error");
          }
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
        onJoined: ({ scene, version, filesOmitted }) => {
          if (disposed) {
            return;
          }
          isRemoteUpdateRef.current = true;
          applyScene(scene, version, filesOmitted);
          setSaveStatus("connected");
          isRemoteUpdateRef.current = false;
          const pending = pendingSnapshotRef.current;
          if (pending) debouncedSendScene(pending);
        },
        onScene: ({ data, version, filesOmitted }) => {
          if (disposed) {
            return;
          }
          isRemoteUpdateRef.current = true;
          applyScene(data, version, filesOmitted);
          setSaveStatus("connected");
          isRemoteUpdateRef.current = false;
        },
        onParticipants: (nextParticipants) => {
          setParticipants(nextParticipants);
          const participantIds = new Set(
            nextParticipants.map((participant) => participant.id),
          );
          setCursors((current) =>
            current.filter((cursor) => participantIds.has(cursor.id)),
          );
        },
        onCursor: ({ from, username, isStudent, pointer, button }) => {
          setCursors((current) => {
            const cursor: TBoardCursor = {
              id: from,
              username:
                username || (isStudent ? "Ученик" : "Учитель"),
              isStudent,
              x: pointer.x,
              y: pointer.y,
              tool: pointer.tool === "laser" ? "laser" : "pointer",
              button: button === "down" ? "down" : "up",
            };
            const existingIndex = current.findIndex(
              (item) => item.id === from,
            );
            if (existingIndex < 0) {
              return [...current, cursor];
            }
            return current.map((item, index) =>
              index === existingIndex ? cursor : item,
            );
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
        closeSessionOnUnmountRef.current &&
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
    autoStartHostSession,
    closeSessionOnUnmount,
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
    loadProgress,
    contentRevision,
    cursors,
    participants,
    queueSave,
    flushSave,
    leaveSession,
  };
};
