"use client";

import { MegaphoneIcon } from "@/components/icons/MegaphoneIcon";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { Spinner } from "@nextui-org/react";
import i18n from "@/i18n/config";
import { FC, MouseEvent } from "react";
import {
  SPEAK_WORD_BUTTON_CLASS,
  SPEAK_WORD_BUTTON_SIZE,
} from "../../constants";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";
import { isYandexTtsLanguageSupported } from "../../utils/ttsSupportedLanguages";

type TProps = {
  id: string;
  text: string;
  languageCode?: string;
  disabled?: boolean;
  size?: number;
};

export const SpeakWordButton: FC<TProps> = ({
  id,
  text,
  languageCode,
  disabled = false,
  size = SPEAK_WORD_BUTTON_SIZE,
}) => {
  const { speak, isLoading } = useTextToSpeech();
  const loading = isLoading(id);
  const isLanguageSupported = isYandexTtsLanguageSupported(languageCode);
  const isDisabled =
    disabled || loading || !text.trim() || !isLanguageSupported;
  const unavailableHint = i18n.t("dictionary.pronunciationUnavailable");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) {
      return;
    }
    void speak(id, text, languageCode);
  };

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={
        isLanguageSupported
          ? i18n.t("dictionary.playPronunciation")
          : unavailableHint
      }
      className={SPEAK_WORD_BUTTON_CLASS}
    >
      {loading ? (
        <Spinner size="sm" color="primary" />
      ) : (
        <MegaphoneIcon size={size} className="text-primary" />
      )}
    </button>
  );

  if (isLanguageSupported) {
    return button;
  }

  return (
    <ResponsiveTooltip content={unavailableHint} placement="top" delay={200}>
      <span className="inline-flex shrink-0 cursor-not-allowed">{button}</span>
    </ResponsiveTooltip>
  );
};
