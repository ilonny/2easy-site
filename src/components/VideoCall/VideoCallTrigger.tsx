"use client";

import { FC } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { LessonToolTrigger } from "@/app/lessons/components/LessonToolTrigger";
import { useVideoCall } from "./VideoCallContext";

const VideoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

/** Lesson FAB control that opens the app-scoped video call shell. */
export const VideoCallTrigger: FC = () => {
  const { isOpen, canOpen, open } = useVideoCall();

  if (!canOpen || isOpen) return null;

  const label = i18n.t("videoCall.title");
  return (
    <LessonToolTrigger
      label={<T k="videoCall.title" />}
      ariaLabel={label}
      icon={<VideoIcon />}
      onClick={open}
    />
  );
};
