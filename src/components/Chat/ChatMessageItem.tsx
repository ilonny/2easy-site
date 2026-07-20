"use client";

import { FC, useState } from "react";
import { Message } from "@chatscope/chat-ui-kit-react";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { CHAT_ALLOWED_EMOJIS } from "./constants";
import type { TChatMessage } from "./types";
import { T } from "@/i18n/T";
import { formatChatEditedAt } from "./utils/formatChatEditedAt";
import styles from "./styles.module.css";

type TProps = {
  message: TChatMessage;
  isReplyTarget?: boolean;
  onReply: (message: TChatMessage) => void;
  onEdit: (message: TChatMessage) => void;
  onToggleReaction: (messageId: number, emoji: string) => void;
};

export const ChatMessageItem: FC<TProps> = ({
  message,
  isReplyTarget = false,
  onReply,
  onEdit,
  onToggleReaction,
}) => {
  const [reactionOpen, setReactionOpen] = useState(false);
  const isMine = !!message.is_mine;
  const editedLabel = formatChatEditedAt(message.edited_at);
  const myEmoji = message.reactions?.find((r) => r.reacted_by_me)?.emoji;

  return (
    <div
      className={`${styles.messageWrap} ${
        isReplyTarget ? styles.messageReplyTarget : ""
      }`}
    >
      <Message
        model={{
          direction: message.direction,
          position: message.position || "normal",
          sender: message.sender,
        }}
      >
        <Message.Header sender={message.sender} />
        <Message.CustomContent>
          {message.reply_to ? (
            <div className={styles.replyQuote}>
              <span className={styles.replySender}>
                {message.reply_to.sender}
              </span>
              <span className={styles.replyText}>{message.reply_to.message}</span>
            </div>
          ) : null}
          <div className={styles.text}>{message.message}</div>
          {message.edited_at ? (
            <div className={styles.edited}>
              <T k="lessons.chatEdited" />
              {editedLabel ? ` ${editedLabel}` : ""}
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
                  onClick={() => {
                    // Chip click always toggles this emoji for me
                    onToggleReaction(message.id, reaction.emoji);
                  }}
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
            <Popover
              placement="top"
              offset={8}
              isOpen={reactionOpen}
              onOpenChange={setReactionOpen}
            >
              <PopoverTrigger>
                <button type="button" className={styles.actionBtn}>
                  <T k="lessons.chatReact" />
                </button>
              </PopoverTrigger>
              <PopoverContent className={styles.emojiPopover}>
                <div className={styles.emojiPicker}>
                  {CHAT_ALLOWED_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`${styles.emojiBtn} ${
                        myEmoji === emoji ? styles.emojiBtnActive : ""
                      }`}
                      onMouseDown={(e) => {
                        // Prevent ghost-click from closing popover onto a chip below
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleReaction(message.id, emoji);
                        window.setTimeout(() => setReactionOpen(false), 0);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </Message.CustomContent>
      </Message>
    </div>
  );
};
