"use client";

import { TBoard } from "@/app/board/types";
import { useBoardEditorChrome } from "@/app/board/hooks/useBoardEditorChrome";
import {
  BOARD_EDITOR_MODAL_CLASS_NAMES,
} from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardEditorChrome } from "@/app/board/components/BoardEditorChrome";
import { T } from "@/i18n/T";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback } from "react";

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
  const { editor, statusLabel, isEditorReady, editorKey, editorAreaStyle } =
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
          <p>{board?.title || <T k="boards.myBoards" />}</p>
        </ModalHeader>
        <ModalBody className="flex flex-1 min-h-0 flex-col" style={editorAreaStyle}>
          {boardId ? (
            <BoardEditorChrome
              boardId={boardId}
              editorKey={editorKey}
              editor={editor}
              isEditorReady={isEditorReady}
              statusLabel={statusLabel}
              isHost={isHost}
            />
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
