import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import {
  snapshotToExcalidrawInitialData,
  TBoardSnapshot,
} from "../types";
import { soloBoardSyncAdapter } from "../sync/SoloBoardSyncAdapter";
import { BoardContentConflictError } from "../sync/types";

type TSaveStatus = "idle" | "loading" | "saving" | "saved" | "error";

const SAVE_DEBOUNCE_MS = 2500;

export const useBoardContent = (boardId?: number, isOpen?: boolean) => {
  const [saveStatus, setSaveStatus] = useState<TSaveStatus>("idle");
  const [initialData, setInitialData] = useState<ReturnType<
    typeof snapshotToExcalidrawInitialData
  > | null>(null);
  const [contentRevision, setContentRevision] = useState(0);
  const versionRef = useRef(0);
  const pendingSnapshotRef = useRef<TBoardSnapshot | null>(null);
  const skipNextSaveRef = useRef(true);

  const applyLoadedContent = useCallback(
    (data: TBoardSnapshot, version: number) => {
      versionRef.current = version;
      skipNextSaveRef.current = true;
      pendingSnapshotRef.current = null;
      setInitialData(snapshotToExcalidrawInitialData(data));
      setContentRevision((v) => v + 1);
    },
    [],
  );

  const load = useCallback(async () => {
    if (!boardId) return;
    setSaveStatus("loading");
    try {
      const result = await soloBoardSyncAdapter.load(boardId);
      applyLoadedContent(result.data, result.version);
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      toast(i18n.t("boards.loadError"), { type: "error" });
    }
  }, [applyLoadedContent, boardId]);

  useEffect(() => {
    if (!isOpen || !boardId) {
      setInitialData(null);
      setSaveStatus("idle");
      pendingSnapshotRef.current = null;
      return;
    }
    load();
  }, [isOpen, boardId, load]);

  const saveNow = useCallback(
    async (snapshot: TBoardSnapshot) => {
      if (!boardId) return;
      setSaveStatus("saving");
      try {
        const nextVersion = await soloBoardSyncAdapter.save(
          boardId,
          snapshot,
          versionRef.current,
        );
        versionRef.current = nextVersion;
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
      }
    },
    [applyLoadedContent, boardId],
  );

  const debouncedSave = useDebouncedCallback(
    async (snapshot: TBoardSnapshot) => {
      await saveNow(snapshot);
    },
    SAVE_DEBOUNCE_MS,
  );

  const queueSave = useCallback(
    (snapshot: TBoardSnapshot) => {
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
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
    contentRevision,
    isLoading: saveStatus === "loading",
    queueSave,
    flushSave,
    reload: load,
  };
};
