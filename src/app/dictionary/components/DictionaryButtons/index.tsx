"use client";

import { Button } from "@nextui-org/react";
import { FC, MouseEvent } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { DictionaryIcon } from "@/components/icons/DictionaryIcon";

export const LessonDictionaryButton: FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <Button
    endContent={<DictionaryIcon />}
    color="primary"
    variant="light"
    onClick={onClick}
    size="lg"
    style={{ minWidth: 300 }}
  >
    <T k="dictionary.tab" defaultText="Словарь" />
  </Button>
);

export const IconDictionaryButton: FC<{
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    isIconOnly
    size="sm"
    variant="light"
    color="primary"
    radius="lg"
    aria-label={i18n.t("dictionary.tab")}
    className={`h-8 w-8 min-w-8 shrink-0 rounded-lg sm:h-9 sm:w-9 sm:min-w-9 ${className}`}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
  >
    <DictionaryIcon size={18} className="text-primary" />
  </Button>
);

