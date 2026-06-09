import { fetchPostBlob } from "@/api";
import { SPEECH_SYNTHESIZE_PATH } from "../constants";
import { TSynthesizeSpeechPayload } from "../types";

export const requestSpeechAudio = (
  text: string,
  signal?: AbortSignal
) => {
  const payload: TSynthesizeSpeechPayload = { text };

  return fetchPostBlob({
    path: SPEECH_SYNTHESIZE_PATH,
    isSecure: true,
    data: payload,
    signal,
  });
};
