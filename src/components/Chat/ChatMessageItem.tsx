"use client";

import { FC, useState } from "react";
import styles from "./styles.module.css";
import { CHAT_ALLOWED_EMOJIS } from "./constants";
import type { TChatMessage } from "./types";
import { T } from "@/i18n/T";

type TProps = {
  message: TChatMessage;
  onReply: (message: TChatMessage) => void;
  onEdit: (message: TChatMessage) => void;
  onToggleReaction: (messageId: number, emoji: string) => void;
};

export const ChatMessageItem: FC<TProps> = ({
  message,
  onReply,
  onEdit,
  onToggleReaction,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const isOutgoing = message.direction === "outgoing";
  const isMine = !!message.is_mine;

  return (
    <div
      className={`${styles.messageRow} ${
        isOutgoing ? styles.outgoing : styles.incoming
      }`}
    >
      <div className={styles.bubble}>
        <div className={styles.sender}>{message.sender}</div>
        {message.reply_to ? (
          <div className={styles.replyQuote}>
            <span className={styles.replySender}>{message.reply_to.sender}</span>
            <span className={styles.replyText}>{message.reply_to.message}</span>
          </div>
        ) : null}
        <div className={styles.text}>{message.message}</div>
        {message.edited_at ? (
          <div className={styles.edited}>
            <T k="lessons.chatEdited" />
          </div>
        ) : null}
        {!!message.reactions?.length && (
          <div className={styles.reactions}>
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                className={`${styles.reactionChip} ${
                  reaction.reacted_by_me ? styles.reactionMine : ""
                }`}
                onClick={() => onToggleReaction(message.id, reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onReply(message)}
          >
            <T k="lessons.chatReply" />
          </button>
          {isMine ? (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => onEdit(message)}
            >
              <T k="lessons.chatEdit" />
            </button>
          ) : null}
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowPicker((v) => !v)}
          >
            <T k="lessons.chatReact" />
          </button>
        </div>
        {showPicker ? (
          <div className={styles.emojiPicker}>
            {CHAT_ALLOWED_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={styles.emojiBtn}
                onClick={() => {
                  onToggleReaction(message.id, emoji);
                  setShowPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
