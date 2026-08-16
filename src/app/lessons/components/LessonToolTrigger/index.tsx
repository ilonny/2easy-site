"use client";

import { Button } from "@nextui-org/react";
import { FC, ReactNode } from "react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { LESSON_FAB_BUTTON_CLASS } from "@/app/lessons/constants";

type TProps = {
  label: ReactNode;
  ariaLabel: string;
  icon: ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  /** Hide from `md` up (e.g. participants — desktop uses the aside). */
  mobileOnly?: boolean;
};

/** Icon-only lesson tool control (dictionary / video / chat / board) on all viewports. */
export const LessonToolTrigger: FC<TProps> = ({
  ariaLabel,
  icon,
  onClick,
  isLoading,
  mobileOnly,
}) => {
  return (
    <ResponsiveTooltip content={ariaLabel} placement="left">
      <Button
        isIconOnly
        color="primary"
        variant="light"
        onClick={onClick}
        size="lg"
        isLoading={isLoading}
        aria-label={ariaLabel}
        className={
          mobileOnly
            ? `${LESSON_FAB_BUTTON_CLASS} md:hidden`
            : LESSON_FAB_BUTTON_CLASS
        }
      >
        {icon}
      </Button>
    </ResponsiveTooltip>
  );
};
