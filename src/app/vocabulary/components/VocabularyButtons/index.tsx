"use client";

import { Button } from "@nextui-org/react";
import { FC, MouseEvent } from "react";
import { T } from "@/i18n/T";

export const DictionaryIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const lessonActionButtonClass =
  "w-full max-w-[300px] justify-between font-medium";

export const LessonVocabularyButton: FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <Button
    endContent={<DictionaryIcon />}
    color="primary"
    variant="light"
    onClick={onClick}
    size="lg"
    className={lessonActionButtonClass}
  >
    <T k="vocabulary.tab" defaultText="Словарь" />
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
    endContent={<DictionaryIcon />}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
  >
    <T k="vocabulary.tab" defaultText="Словарь" />
  </Button>
);
