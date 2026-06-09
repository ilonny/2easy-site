"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import { parseApiErrorMessage } from "../utils/apiError";
import { requestSpeechAudio } from "../utils/requestSpeechAudio";
import {
  clearSpeechAbortController,
  createSpeechAbortController,
  getSpeechPlaybackState,
  playSpeechBlob,
  setSpeechPlaybackState,
  stopSpeechPlayback,
  subscribeToSpeechPlayback,
} from "../utils/speechPlayback";

export const useTextToSpeech = () => {
  const [, setRevision] = useState(0);

  useEffect(() => subscribeToSpeechPlayback(() => setRevision((value) => value + 1)), []);

  useEffect(() => () => stopSpeechPlayback(), []);

  const speak = useCallback(async (id: string, text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    const abortController = createSpeechAbortController();
    setSpeechPlaybackState({ activeId: id, isLoading: true });

    try {
      const res = await requestSpeechAudio(trimmedText, abortController.signal);

      if (abortController.signal.aborted) {
        return;
      }

      if (!res?.ok) {
        toast(await parseApiErrorMessage(res), { type: "error" });
        stopSpeechPlayback();
        return;
      }

      const blob = await res.blob();

      if (abortController.signal.aborted) {
        return;
      }

      await playSpeechBlob(blob, id);
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      stopSpeechPlayback();
      toast(i18n.t("dictionary.pronunciationError"), { type: "error" });
    } finally {
      clearSpeechAbortController(abortController);
    }
  }, []);

  const isLoading = useCallback((id: string) => {
    const { activeId, isLoading: loading } = getSpeechPlaybackState();
    return loading && activeId === id;
  }, []);

  return { speak, isLoading, stopSpeech: stopSpeechPlayback };
};
