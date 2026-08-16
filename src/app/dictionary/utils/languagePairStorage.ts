export const DICTIONARY_LANGUAGE_PAIR_STORAGE_KEY =
  "dictionary_last_language_pair";

export const DEFAULT_SOURCE_LANGUAGE_CODE = "en";
export const DEFAULT_TARGET_LANGUAGE_CODE = "ru";

export type TLanguagePair = {
  sourceLanguageCode: string;
  targetLanguageCode: string;
};

export const DEFAULT_LANGUAGE_PAIR: TLanguagePair = {
  sourceLanguageCode: DEFAULT_SOURCE_LANGUAGE_CODE,
  targetLanguageCode: DEFAULT_TARGET_LANGUAGE_CODE,
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && Boolean(value.trim());

export const getStoredLanguagePair = (): TLanguagePair => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE_PAIR;
  }

  try {
    const raw = window.localStorage.getItem(DICTIONARY_LANGUAGE_PAIR_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_LANGUAGE_PAIR;
    }

    const parsed = JSON.parse(raw) as Partial<TLanguagePair>;

    return {
      sourceLanguageCode: isNonEmptyString(parsed.sourceLanguageCode)
        ? parsed.sourceLanguageCode.trim()
        : DEFAULT_SOURCE_LANGUAGE_CODE,
      targetLanguageCode: isNonEmptyString(parsed.targetLanguageCode)
        ? parsed.targetLanguageCode.trim()
        : DEFAULT_TARGET_LANGUAGE_CODE,
    };
  } catch {
    return DEFAULT_LANGUAGE_PAIR;
  }
};

export const setStoredLanguagePair = (pair: TLanguagePair) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    DICTIONARY_LANGUAGE_PAIR_STORAGE_KEY,
    JSON.stringify({
      sourceLanguageCode: pair.sourceLanguageCode,
      targetLanguageCode: pair.targetLanguageCode,
    })
  );
};
