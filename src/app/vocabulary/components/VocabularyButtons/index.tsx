"use client";

import { Button } from "@nextui-org/react";
import { FC, MouseEvent } from "react";
import { T } from "@/i18n/T";
import { VocabularyIcon } from "@/components/icons/VocabularyIcon";

export const LessonVocabularyButton: FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <Button
    endContent={<VocabularyIcon />}
    color="primary"
    variant="light"
    onClick={onClick}
    size="lg"
    style={{ minWidth: 300 }}
  >
    <T k="vocabulary.tab" defaultText="Словарь" />
  </Button>
);

export const IconVocabularyButton: FC<{
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    isIconOnly
    size="sm"
    variant="light"
    color="primary"
    radius="lg"
    aria-label="Словарь"
    className={`h-8 w-8 min-w-8 shrink-0 rounded-lg sm:h-9 sm:w-9 sm:min-w-9 ${className}`}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
  >
    <VocabularyIcon size={18} className="text-primary" />
  </Button>
);

export const CompactVocabularyButton: FC<{
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    size="sm"
    variant="flat"
    color="primary"
    className={`mt-2 w-full min-h-0 text-[8px] leading-tight sm:text-[10px] md:text-xs ${className}`}
    endContent={<VocabularyIcon size={16} className="text-primary" />}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
  >
    <T k="vocabulary.tab" defaultText="Словарь" />
  </Button>
);
