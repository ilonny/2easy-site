"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import { BOARD_SAVE_DEBOUNCE_MS } from "../constants";
import {
  getBoardSnapshotFingerprint,
  snapshotToExcalidrawInitialData,
  type TExcalidrawInitialData,
} from "../utils/boardSnapshot";
import { loadBoardDetail } from "../api/loadBoardContent";
import {
  TBoard,
  TBoardSaveStatus,
  TBoardSnapshot,
} from "../types";
import { soloBoardSyncAdapter } from "../sync/SoloBoardSyncAdapter";
import { BoardContentConflictError } from "../sync/types";

export const useBoardContent = (boardId?: number, isOpen?: boolean) => {
  const [saveStatus, setSaveStatus] = useState<TBoardSaveStatus>("idle");
  const [initialData, setInitialData] = useState<TExcalidrawInitialData | null>(
    null,
  );
  const [board, setBoard] = useState<TBoard | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [contentRevision, setContentRevision] = useState(0);

  const versionRef = useRef(0);
  const pendingSnapshotRef = useRef<TBoardSnapshot | null>(null);
  const deferredSnapshotRef = useRef<TBoardSnapshot | null>(null);
  const lastSavedFingerprintRef = useRef<string | null>(null);
  const isSavingRef = useRef(false);

  const resetSyncState = useCallback(() => {
    versionRef.current = 0;
    pendingSnapshotRef.current = null;
    deferredSnapshotRef.current = null;
    lastSavedFingerprintRef.current = null;
    isSavingRef.current = false;
  }, []);

  const applyLoadedContent = useCallback((data: TBoardSnapshot, version: number) => {
    versionRef.current = version;
    pendingSnapshotRef.current = null;
    deferredSnapshotRef.current = null;
    lastSavedFingerprintRef.current = getBoardSnapshotFingerprint(data);
    setInitialData(snapshotToExcalidrawInitialData(data));
    setContentRevision((value) => value + 1);
  }, []);

  const load = useCallback(async () => {
    if (!boardId) return;

    setSaveStatus("loading");
    setLoadError(false);
    try {
      const detail = await loadBoardDetail(boardId);
      if (!detail) {
        setLoadError(true);
        setSaveStatus("error");
        toast(i18n.t("boards.loadError"), { type: "error" });
        return;
      }

      setBoard(detail.board);
      applyLoadedContent(detail.content.data, detail.content.version);
      setSaveStatus("saved");
    } catch {
      setLoadError(true);
      setSaveStatus("error");
      toast(i18n.t("boards.loadError"), { type: "error" });
    }
  }, [applyLoadedContent, boardId]);

  useEffect(() => {
    if (!isOpen || !boardId) {
      setInitialData(null);
      setBoard(null);
      setLoadError(false);
      setSaveStatus("idle");
      resetSyncState();
      return;
    }

    void load();
  }, [boardId, isOpen, load, resetSyncState]);

  const performSave = useCallback(
    async (snapshot: TBoardSnapshot) => {
      if (!boardId) return;

      const fingerprint = getBoardSnapshotFingerprint(snapshot);
      if (fingerprint === lastSavedFingerprintRef.current) {
        pendingSnapshotRef.current = null;
        return;
      }

      isSavingRef.current = true;
      setSaveStatus("saving");

      try {
        const nextVersion = await soloBoardSyncAdapter.save(
          boardId,
          snapshot,
          versionRef.current,
        );
        versionRef.current = nextVersion;
        lastSavedFingerprintRef.current = fingerprint;
        pendingSnapshotRef.current = null;
        setSaveStatus("saved");
      } catch (err) {
        if (err instanceof BoardContentConflictError) {
          applyLoadedContent(err.content.data, err.content.version);
          setSaveStatus("saved");
          toast(i18n.t("boards.conflictError"), { type: "warning" });
          return;
        }

        setSaveStatus("error");
        toast(i18n.t("boards.saveError"), { type: "error" });
      } finally {
        isSavingRef.current = false;
      }
    },
    [applyLoadedContent, boardId],
  );

  const saveNow = useCallback(
    async (snapshot: TBoardSnapshot) => {
      if (isSavingRef.current) {
        deferredSnapshotRef.current = snapshot;
        pendingSnapshotRef.current = snapshot;
        return;
      }

      await performSave(snapshot);

      while (deferredSnapshotRef.current) {
        const deferred = deferredSnapshotRef.current;
        deferredSnapshotRef.current = null;

        if (
          getBoardSnapshotFingerprint(deferred) === lastSavedFingerprintRef.current
        ) {
          pendingSnapshotRef.current = null;
          continue;
        }

        await performSave(deferred);
      }
    },
    [performSave],
  );

  const debouncedSave = useDebouncedCallback((snapshot: TBoardSnapshot) => {
    void saveNow(snapshot);
  }, BOARD_SAVE_DEBOUNCE_MS);

  useEffect(() => {
    if (!isOpen) {
      debouncedSave.cancel();
    }
  }, [debouncedSave, isOpen]);

  const queueSave = useCallback(
    (snapshot: TBoardSnapshot) => {
      if (getBoardSnapshotFingerprint(snapshot) === lastSavedFingerprintRef.current) {
        return;
      }

      pendingSnapshotRef.current = snapshot;
      debouncedSave(snapshot);
    },
    [debouncedSave],
  );

  const flushSave = useCallback(async () => {
    debouncedSave.cancel();
    const pending = pendingSnapshotRef.current;
    if (pending) {
      await saveNow(pending);
    }
  }, [debouncedSave, saveNow]);

  return {
    saveStatus,
    initialData,
    board,
    loadError,
    contentRevision,
    queueSave,
    flushSave,
  };
};
