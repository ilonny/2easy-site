import { fetchPostBlob } from "@/api";
import { SPEECH_SYNTHESIZE_PATH } from "../constants";
import { TSynthesizeSpeechPayload } from "../types";

export const requestSpeechAudio = (
  text: string,
  languageCode?: string,
  signal?: AbortSignal
) => {
  const payload: TSynthesizeSpeechPayload = {
    text,
    ...(languageCode ? { languageCode } : {}),
  };

  return fetchPostBlob({
    path: SPEECH_SYNTHESIZE_PATH,
    isSecure: true,
    data: payload,
    signal,
  });
};
