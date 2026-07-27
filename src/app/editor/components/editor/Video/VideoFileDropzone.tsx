"use client";

import { FC, DragEvent, useCallback, useRef, useState } from "react";
import Image from "next/image";
import Close from "@/assets/icons/close.svg";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

const ACCEPTED_EXT = [".mp4", ".mov", ".webm", ".m4v"];
const ACCEPTED_MIME = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
];

export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

type TProps = {
  fileName?: string;
  error?: string | null;
  disabled?: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
  onError: (message: string | null) => void;
};

const isAcceptedVideo = (file: File) => {
  const lower = file.name.toLowerCase();
  const byExt = ACCEPTED_EXT.some((ext) => lower.endsWith(ext));
  const byMime =
    !file.type ||
    ACCEPTED_MIME.includes(file.type) ||
    file.type.startsWith("video/");
  return byExt && byMime;
};

export const VideoFileDropzone: FC<TProps> = ({
  fileName,
  error,
  disabled,
  onFile,
  onClear,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const validateAndAccept = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!isAcceptedVideo(file)) {
        onError(
          i18n.t("editor.videoFileInvalidType", {
            defaultValue: (i18n.language || "")
              .toLowerCase()
              .startsWith("ru")
              ? "Недопустимый формат. Используйте .mp4, .mov или .webm"
              : "Invalid format. Use .mp4, .mov, or .webm",
          }),
        );
        return;
      }
      if (file.size > MAX_VIDEO_BYTES) {
        onError(
          i18n.t("editor.videoFileTooLarge", {
            defaultValue: (i18n.language || "")
              .toLowerCase()
              .startsWith("ru")
              ? "Файл слишком большой (макс. 200 МБ)"
              : "File is too large (max 200 MB)",
          }),
        );
        return;
      }
      onError(null);
      onFile(file);
    },
    [onError, onFile],
  );

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragging(true);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragging(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragging(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    validateAndAccept(file);
  };

  return (
    <div className="mb-3">
      <p className="mb-2 text-sm text-default-500">
        <T
          k="editor.videoFileHint"
          defaultText="Видеофайл (не более 200 МБ, форматы: .mp4, .mov, .webm)"
        />
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-colors ${
          dragging
            ? "border-[#3F28C6] bg-[#3F28C6]/10"
            : "border-[#D0CBE8] bg-white hover:border-[#3F28C6]/60"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mov,.webm,.m4v,video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            validateAndAccept(file);
            e.target.value = "";
          }}
        />
        {fileName ? (
          <div className="flex w-full max-w-full items-center justify-center gap-3 px-2">
            <p
              className="min-w-0 truncate text-center text-sm font-medium text-[#3F28C6]"
              title={fileName}
            >
              {fileName}
            </p>
            <button
              type="button"
              className="shrink-0 rounded-full p-1 hover:bg-[#3F28C6]/10"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                onError(null);
              }}
              aria-label="Remove file"
            >
              <Image priority={false} src={Close} alt="close" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-[#3F28C6]">
              <T
                k="editor.uploadVideoFile"
                defaultText="Загрузить видеофайл"
              />
            </p>
            <p className="text-center text-xs text-[#B7B7B7] max-w-[280px]">
              <T
                k="editor.dragVideoHere"
                defaultText="Нажмите или перетащите видео сюда"
              />
            </p>
          </>
        )}
      </div>
      {!!error && <p className="text-danger mt-1 text-sm">{error}</p>}
    </div>
  );
};

export const formatMb = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  if (mb < 10) return mb.toFixed(1);
  return Math.round(mb).toString();
};
