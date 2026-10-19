"use client";

import { FC } from "react";
import { T } from "@/i18n/T";
import { ChatPendingAttachments } from "./ChatAttachments";
import type { TChatMessage, TChatPendingAttachment } from "./types";
import styles from "./styles.module.css";

type TProps = {
  replyTo: TChatMessage | null;
  editing: TChatMessage | null;
  pendingAttachments: TChatPendingAttachment[];
  uploading?: boolean;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onRemoveAttachment: (localId: string) => void;
};

export const ChatComposerOverlay: FC<TProps> = ({
  replyTo,
  editing,
  pendingAttachments,
  uploading = false,
  onCancelReply,
  onCancelEdit,
  onRemoveAttachment,
}) => {
  if (!replyTo && !editing && !pendingAttachments.length) return null;

  return (
    <div className={styles.composerOverlay}>
      {replyTo ? (
        <div className={styles.replyPreview}>
          <div className={styles.previewMeta}>
            <span className={styles.previewLabel}>
              <T k="lessons.chatReplyingTo" /> {replyTo.sender}
            </span>
            <span className={styles.previewText}>{replyTo.message}</span>
          </div>
          <button
            type="button"
            className={styles.cancelPreview}
            onClick={onCancelReply}
            aria-label="cancel reply"
          >
            ×
          </button>
        </div>
      ) : null}
      {editing ? (
        <div className={styles.editPreview}>
          <div className={styles.previewMeta}>
            <span className={styles.previewLabel}>
              <T k="lessons.chatEditing" />
            </span>
            <span className={styles.previewText}>{editing.message}</span>
          </div>
          <button
            type="button"
            className={styles.cancelPreview}
            onClick={onCancelEdit}
            aria-label="cancel edit"
          >
            ×
          </button>
        </div>
      ) : null}
      <ChatPendingAttachments
        items={pendingAttachments}
        onRemove={onRemoveAttachment}
        uploading={uploading}
      />
    </div>
  );
};
