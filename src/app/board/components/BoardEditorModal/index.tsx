"use client";

import { TBoard } from "@/app/board/types";
import { useBoardEditorChrome } from "@/app/board/hooks/useBoardEditorChrome";
import {
  BOARD_EDITOR_MODAL_CLASS_NAMES,
} from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardEditorChrome } from "@/app/board/components/BoardEditorChrome";
import { BoardParticipantsList } from "@/app/board/components/BoardParticipantsList";
import { T } from "@/i18n/T";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  board?: TBoard | null;
  mode?: "solo" | "realtime";
  isHost?: boolean;
};

export const BoardEditorModal: FC<TProps> = ({
  isOpen,
  onClose,
  board,
  mode = "solo",
  isHost = false,
}) => {
  const boardId = board?.id;
  const [boardApi, setBoardApi] = useState<ExcalidrawImperativeAPI | null>(
    null,
  );
  const { editor, isEditorReady, editorKey } =
    useBoardEditorChrome({
      boardId,
      mode,
      enabled: isOpen && !!boardId,
      isHost,
      editorKeyPrefix: "lesson-board-editor",
    });

  const handleClose = useCallback(async () => {
    if (editor.mode === "realtime" && isHost) {
      await editor.leaveSession();
    } else {
      await editor.flushSave();
    }
    onClose();
  }, [editor, isHost, onClose]);

  // Keep site header (z-60) from covering the board modal/toolbar/close.
  useEffect(() => {
    if (!isOpen) return;
    document.body.dataset.lessonBoardOpen = "1";
    return () => {
      delete document.body.dataset.lessonBoardOpen;
    };
  }, [isOpen]);

  return (
    <Modal
      isDismissable={false}
      hideCloseButton
      size="full"
      radius="none"
      isOpen={isOpen}
      onClose={handleClose}
      scrollBehavior="inside"
      placement="center"
      classNames={BOARD_EDITOR_MODAL_CLASS_NAMES}
    >
      <ModalContent className="flex h-full max-h-[100dvh] flex-col rounded-none">
        <ModalHeader className="relative px-3 py-2.5 pr-14 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6 sm:py-3 sm:pr-14">
          <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">
            <p className="min-w-0 flex-1 truncate text-sm sm:text-base">
              {board?.title || <T k="boards.myBoards" />}
            </p>
            {mode === "realtime" ? (
              <div className="flex shrink-0 items-center overflow-visible py-0.5">
                <BoardParticipantsList
                  api={boardApi}
                  participants={editor.participants}
                  cursors={editor.cursors}
                  variant={isHost ? "teacher" : "student"}
                />
              </div>
            ) : null}
          </div>
          <BoardCloseButton
            variant="header"
            className="z-[90]"
            onClick={() => {
              void handleClose();
            }}
          />
        </ModalHeader>
        <ModalBody className="flex min-h-0 flex-1 flex-col">
          {boardId ? (
            <BoardEditorChrome
              boardId={boardId}
              editorKey={editorKey}
              editor={editor}
              isEditorReady={isEditorReady}
              onApiChange={setBoardApi}
            />
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
