import { TSpeechPlaybackState } from "../types";

let sharedState: TSpeechPlaybackState = {
  activeId: null,
  isLoading: false,
};

const subscribers = new Set<() => void>();

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let currentAbortController: AbortController | null = null;

const notifySubscribers = () => {
  subscribers.forEach((subscriber) => subscriber());
};

export const getSpeechPlaybackState = () => sharedState;

export const setSpeechPlaybackState = (partial: Partial<TSpeechPlaybackState>) => {
  sharedState = { ...sharedState, ...partial };
  notifySubscribers();
};

export const subscribeToSpeechPlayback = (subscriber: () => void) => {
  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
};

export const cleanupSpeechPlayback = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
};

export const stopSpeechPlayback = () => {
  currentAbortController?.abort();
  currentAbortController = null;
  cleanupSpeechPlayback();
  setSpeechPlaybackState({ activeId: null, isLoading: false });
};

export const createSpeechAbortController = () => {
  stopSpeechPlayback();
  const abortController = new AbortController();
  currentAbortController = abortController;

  return abortController;
};

export const clearSpeechAbortController = (
  abortController: AbortController
) => {
  if (currentAbortController === abortController) {
    currentAbortController = null;
  }
};

export const playSpeechBlob = async (blob: Blob, id: string) => {
  cleanupSpeechPlayback();

  const objectUrl = URL.createObjectURL(blob);
  currentObjectUrl = objectUrl;

  const audio = new Audio(objectUrl);
  currentAudio = audio;

  return new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      cleanupSpeechPlayback();
      setSpeechPlaybackState({ activeId: null, isLoading: false });
      resolve();
    };

    audio.onerror = () => {
      cleanupSpeechPlayback();
      setSpeechPlaybackState({ activeId: null, isLoading: false });
      reject(new Error("Speech playback failed"));
    };

    setSpeechPlaybackState({ activeId: id, isLoading: false });

    void audio.play().catch(reject);
  });
};
