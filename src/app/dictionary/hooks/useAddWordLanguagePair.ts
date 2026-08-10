import { useCallback, useEffect, useState } from "react";
import { TLanguage } from "../types";
import {
  DEFAULT_LANGUAGE_PAIR,
  DEFAULT_SOURCE_LANGUAGE_CODE,
  DEFAULT_TARGET_LANGUAGE_CODE,
  getStoredLanguagePair,
  setStoredLanguagePair,
  TLanguagePair,
} from "../utils/languagePairStorage";

const resolveLanguageCode = (
  code: string,
  languages: TLanguage[],
  fallbackCode: string
) => {
  if (languages.some((language) => language.code === code)) {
    return code;
  }

  if (languages.some((language) => language.code === fallbackCode)) {
    return fallbackCode;
  }

  return languages[0]?.code || fallbackCode;
};

type TParams = {
  isVisible: boolean;
  languages: TLanguage[];
  loadLanguages: () => void;
};

export const useAddWordLanguagePair = ({
  isVisible,
  languages,
  loadLanguages,
}: TParams) => {
  const [sourceLanguageCode, setSourceLanguageCode] = useState(
    () => getStoredLanguagePair().sourceLanguageCode
  );
  const [targetLanguageCode, setTargetLanguageCode] = useState(
    () => getStoredLanguagePair().targetLanguageCode
  );

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const stored = getStoredLanguagePair();
    setSourceLanguageCode(
      stored.sourceLanguageCode || DEFAULT_SOURCE_LANGUAGE_CODE
    );
    setTargetLanguageCode(
      stored.targetLanguageCode || DEFAULT_TARGET_LANGUAGE_CODE
    );
    loadLanguages();
  }, [isVisible, loadLanguages]);

  useEffect(() => {
    if (!isVisible || !languages.length) {
      return;
    }

    setSourceLanguageCode((prev) =>
      resolveLanguageCode(prev, languages, DEFAULT_SOURCE_LANGUAGE_CODE)
    );
    setTargetLanguageCode((prev) =>
      resolveLanguageCode(prev, languages, DEFAULT_TARGET_LANGUAGE_CODE)
    );
  }, [isVisible, languages]);

  const swapLanguages = useCallback(() => {
    setSourceLanguageCode(targetLanguageCode);
    setTargetLanguageCode(sourceLanguageCode);
  }, [sourceLanguageCode, targetLanguageCode]);

  const persistLanguagePair = useCallback(() => {
    const pair: TLanguagePair = {
      sourceLanguageCode: sourceLanguageCode || DEFAULT_LANGUAGE_PAIR.sourceLanguageCode,
      targetLanguageCode: targetLanguageCode || DEFAULT_LANGUAGE_PAIR.targetLanguageCode,
    };
    setStoredLanguagePair(pair);
  }, [sourceLanguageCode, targetLanguageCode]);

  return {
    sourceLanguageCode,
    targetLanguageCode,
    setSourceLanguageCode,
    setTargetLanguageCode,
    swapLanguages,
    persistLanguagePair,
  };
};
