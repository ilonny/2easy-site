/**
 * Languages Yandex SpeechKit TTS can synthesize (API v1).
 * Keep in sync with backend TTS_VOICE_BY_LANGUAGE_CODE.
 * @see https://yandex.cloud/ru/docs/speechkit/tts/voices
 */
export const YANDEX_TTS_SUPPORTED_LANGUAGE_CODES = [
  "en",
  "ru",
  "de",
  "he",
  "kk",
  "uz",
] as const;

export type YandexTtsLanguageCode =
  (typeof YANDEX_TTS_SUPPORTED_LANGUAGE_CODES)[number];

export const DEFAULT_TTS_LANGUAGE_CODE: YandexTtsLanguageCode = "en";

export const normalizeTtsLanguageCode = (languageCode?: string) => {
  if (!languageCode?.trim()) {
    return DEFAULT_TTS_LANGUAGE_CODE;
  }

  return (
    languageCode.trim().toLowerCase().split(/[-_]/)[0] ||
    DEFAULT_TTS_LANGUAGE_CODE
  );
};

export const isYandexTtsLanguageSupported = (languageCode?: string) => {
  const normalized = normalizeTtsLanguageCode(languageCode);
  return (YANDEX_TTS_SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(
    normalized
  );
};
