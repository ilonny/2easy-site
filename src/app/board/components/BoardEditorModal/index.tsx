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
import { FC, useCallback, useState } from "react";

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

  return (
    <Modal
      isDismissable={false}
      hideCloseButton={false}
      closeButton={<BoardCloseButton />}
      size="full"
      radius="none"
      isOpen={isOpen}
      onClose={handleClose}
      scrollBehavior="inside"
      placement="center"
      classNames={BOARD_EDITOR_MODAL_CLASS_NAMES}
    >
      <ModalContent className="h-full max-h-[100dvh] rounded-none flex flex-col">
        <ModalHeader className="px-4 py-3 sm:px-6">
          <div className="flex w-full items-center gap-3">
            <p className="min-w-0 flex-1 truncate">
              {board?.title || <T k="boards.myBoards" />}
            </p>
            {mode === "realtime" ? (
              <div className="flex shrink-0 items-center pr-10">
                <BoardParticipantsList
                  api={boardApi}
                  participants={editor.participants}
                  cursors={editor.cursors}
                  variant={isHost ? "teacher" : "student"}
                />
              </div>
            ) : null}
          </div>
        </ModalHeader>
        <ModalBody className="flex flex-1 min-h-0 flex-col">
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
