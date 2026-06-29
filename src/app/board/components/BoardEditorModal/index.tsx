"use client";

import { TBoard } from "@/app/board/types";
import { useBoardEditor } from "@/app/board/hooks/useBoardEditor";
import {
  BOARD_EDITOR_JIVO_OFFSET_PX,
  BOARD_EDITOR_MODAL_CLASS_NAMES,
} from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardEditorShell } from "@/app/board/components/BoardEditorShell";
import { getBoardSaveStatusLabel } from "@/app/board/utils/saveStatus";
import { T } from "@/i18n/T";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useMemo } from "react";

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
  const editor = useBoardEditor({
    boardId,
    mode,
    enabled: isOpen && !!boardId,
    isHost,
  });

  const handleClose = useCallback(async () => {
    if (editor.mode === "realtime" && isHost) {
      await editor.leaveSession();
    } else {
      await editor.flushSave();
    }
    onClose();
  }, [editor, isHost, onClose]);

  const statusLabel = useMemo(
    () => getBoardSaveStatusLabel(editor.saveStatus),
    [editor.saveStatus],
  );

  const isEditorReady =
    !!editor.initialData && !!boardId && !editor.isWaitingForHost;

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
        <ModalBody
          className="flex flex-1 min-h-0 flex-col"
          style={
            {
              paddingBottom: BOARD_EDITOR_JIVO_OFFSET_PX,
              "--board-jivo-offset": `${BOARD_EDITOR_JIVO_OFFSET_PX}px`,
            } as React.CSSProperties
          }
        >
          {boardId && editor.initialData ? (
            <BoardEditorShell
              boardId={boardId}
              editorKey={`lesson-board-editor-${boardId}`}
              contentRevision={editor.contentRevision}
              initialData={editor.initialData}
              isWaitingForHost={editor.isWaitingForHost}
              isEditorReady={isEditorReady}
              syncMode={editor.mode}
              statusLabel={statusLabel}
              onSceneChange={editor.queueSave}
              waitingText={<T k="boards.waitingForHost" />}
            />
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
