"use client";

import { MegaphoneIcon } from "@/components/icons/MegaphoneIcon";
import { Spinner } from "@nextui-org/react";
import i18n from "@/i18n/config";
import { FC, MouseEvent } from "react";
import {
  SPEAK_WORD_BUTTON_CLASS,
  SPEAK_WORD_BUTTON_SIZE,
} from "../../constants";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";

type TProps = {
  id: string;
  text: string;
  disabled?: boolean;
  size?: number;
};

export const SpeakWordButton: FC<TProps> = ({
  id,
  text,
  disabled = false,
  size = SPEAK_WORD_BUTTON_SIZE,
}) => {
  const { speak, isLoading } = useTextToSpeech();
  const loading = isLoading(id);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    void speak(id, text);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading || !text.trim()}
      aria-label={i18n.t("dictionary.playPronunciation")}
      className={SPEAK_WORD_BUTTON_CLASS}
    >
      {loading ? (
        <Spinner size="sm" color="primary" />
      ) : (
        <MegaphoneIcon size={size} className="text-primary" />
      )}
    </button>
  );
};
