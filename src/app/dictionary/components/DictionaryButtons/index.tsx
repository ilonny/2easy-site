"use client";

import { Button } from "@nextui-org/react";
import { FC, MouseEvent } from "react";
import i18n from "@/i18n/config";
import { DictionaryIcon } from "@/components/icons/DictionaryIcon";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import {
  ICON_DICTIONARY_BUTTON_BASE_CLASS,
  ICON_DICTIONARY_BUTTON_COMPACT_SIZE_CLASS,
  ICON_DICTIONARY_BUTTON_DEFAULT_SIZE_CLASS,
} from "../../constants";
import { LESSON_FAB_BUTTON_CLASS } from "@/app/lessons/constants";

export const LessonDictionaryButton: FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  const label = i18n.t("dictionary.tab");

  return (
    <ResponsiveTooltip content={label} placement="left">
      <Button
        isIconOnly
        color="primary"
        variant="light"
        onClick={onClick}
        size="lg"
        aria-label={label}
        className={LESSON_FAB_BUTTON_CLASS}
      >
        <DictionaryIcon size={22} />
      </Button>
    </ResponsiveTooltip>
  );
};

type TIconDictionaryButtonProps = {
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  iconSize?: number;
  mdIconSize?: number;
  size?: "default" | "compact";
};

export const IconDictionaryButton: FC<TIconDictionaryButtonProps> = ({
  onClick,
  className = "",
  iconSize = 20,
  mdIconSize = iconSize,
  size = "default",
}) => {
  const sizeClass =
    size === "compact"
      ? ICON_DICTIONARY_BUTTON_COMPACT_SIZE_CLASS
      : ICON_DICTIONARY_BUTTON_DEFAULT_SIZE_CLASS;

  return (
    <Button
      isIconOnly
      size="sm"
      variant="light"
      color="primary"
      radius="lg"
      aria-label={i18n.t("dictionary.tab")}
      className={`${ICON_DICTIONARY_BUTTON_BASE_CLASS} ${sizeClass} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      {iconSize === mdIconSize ? (
        <DictionaryIcon size={iconSize} className="text-primary" />
      ) : (
        <>
          <DictionaryIcon size={iconSize} className="text-primary md:hidden" />
          <DictionaryIcon
            size={mdIconSize}
            className="hidden text-primary md:block"
          />
        </>
      )}
    </Button>
  );
};
