"use client";

import { FC } from "react";
import { getImageUrl } from "@/app/editor/helpers";
import type { TChatAttachment, TChatPendingAttachment } from "./types";
import { formatChatFileSize } from "./utils/attachmentKind";
import styles from "./styles.module.css";

type TPendingProps = {
  items: TChatPendingAttachment[];
  onRemove: (localId: string) => void;
  uploading?: boolean;
};

export const ChatPendingAttachments: FC<TPendingProps> = ({
  items,
  onRemove,
  uploading = false,
}) => {
  if (!items.length) return null;

  return (
    <div className={styles.pendingAttachments}>
      {items.map((item) => (
        <div key={item.localId} className={styles.pendingCard}>
          {item.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.previewUrl}
              alt={item.name}
              className={styles.pendingImage}
            />
          ) : item.kind === "pdf" ? (
            <iframe
              src={item.previewUrl}
              title={item.name}
              className={styles.pendingPdf}
            />
          ) : item.kind === "audio" ? (
            <audio
              controls
              src={item.previewUrl}
              className={styles.pendingAudio}
              preload="metadata"
            />
          ) : item.kind === "video" ? (
            <video
              controls
              src={item.previewUrl}
              className={styles.pendingVideo}
              preload="metadata"
            />
          ) : (
            <div className={styles.pendingFileFallback}>{item.name}</div>
          )}
          <div className={styles.pendingMeta}>
            <span className={styles.pendingName} title={item.name}>
              {item.name}
            </span>
            <span className={styles.pendingSize}>
              {formatChatFileSize(item.size)}
            </span>
          </div>
          <button
            type="button"
            className={styles.pendingRemove}
            onClick={() => onRemove(item.localId)}
            disabled={uploading}
            aria-label="remove attachment"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

type TMessageProps = {
  attachments?: TChatAttachment[];
};

export const ChatMessageAttachments: FC<TMessageProps> = ({ attachments }) => {
  if (!attachments?.length) return null;

  return (
    <div className={styles.messageAttachments}>
      {attachments.map((item, index) => {
        const url = getImageUrl(item.path);
        const key = `${item.id || item.path}-${index}`;

        if (item.kind === "image") {
          return (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.messageImageLink}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={item.name} className={styles.messageImage} />
            </a>
          );
        }

        if (item.kind === "pdf") {
          return (
            <div key={key} className={styles.messagePdfWrap}>
              <iframe
                src={url}
                title={item.name}
                className={styles.messagePdf}
              />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.attachmentLink}
              >
                {item.name}
              </a>
            </div>
          );
        }

        if (item.kind === "audio") {
          return (
            <div key={key} className={styles.messageMediaWrap}>
              <audio controls src={url} preload="metadata" className={styles.messageAudio} />
              <span className={styles.attachmentCaption}>{item.name}</span>
            </div>
          );
        }

        if (item.kind === "video") {
          return (
            <div key={key} className={styles.messageMediaWrap}>
              <video
                controls
                src={url}
                preload="metadata"
                className={styles.messageVideo}
              />
              <span className={styles.attachmentCaption}>{item.name}</span>
            </div>
          );
        }

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attachmentLink}
          >
            {item.name}
          </a>
        );
      })}
    </div>
  );
};
