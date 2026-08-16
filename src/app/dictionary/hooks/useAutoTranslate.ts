import { useEffect, useState } from "react";

type TTranslateFn = (
  sourceWord: string,
  sourceLanguageCode?: string,
  targetLanguageCode?: string
) => Promise<{ translatedWord?: string } | null | undefined>;

type TParams = {
  isVisible: boolean;
  sourceWord: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  translateWord: TTranslateFn;
};

export const useAutoTranslate = ({
  isVisible,
  sourceWord,
  sourceLanguageCode,
  targetLanguageCode,
  translateWord,
}: TParams) => {
  const [translatedWord, setTranslatedWord] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (
      !isVisible ||
      !sourceWord.trim() ||
      !sourceLanguageCode ||
      !targetLanguageCode
    ) {
      return;
    }

    if (sourceLanguageCode === targetLanguageCode) {
      setTranslatedWord("");
      setIsTranslating(false);
      return;
    }

    let cancelled = false;

    const loadTranslation = async () => {
      setIsTranslating(true);
      setTranslatedWord("");
      const result = await translateWord(
        sourceWord.trim(),
        sourceLanguageCode,
        targetLanguageCode
      );

      if (!cancelled && result?.translatedWord) {
        setTranslatedWord(result.translatedWord);
      }

      if (!cancelled) {
        setIsTranslating(false);
      }
    };

    void loadTranslation();

    return () => {
      cancelled = true;
    };
  }, [
    isVisible,
    sourceLanguageCode,
    sourceWord,
    targetLanguageCode,
    translateWord,
  ]);

  return {
    translatedWord,
    setTranslatedWord,
    isTranslating,
  };
};
