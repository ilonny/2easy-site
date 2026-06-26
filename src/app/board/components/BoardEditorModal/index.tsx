"use client";

import { TBoard, TBoardSaveStatus } from "@/app/board/types";
import { useBoardContent } from "@/app/board/hooks/useBoardContent";
import {
  BOARD_EDITOR_MODAL_CLASS_NAMES,
  BOARD_SAVE_STATUS_LABEL_KEY,
} from "@/app/board/constants";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import { FC, useCallback, useMemo } from "react";
import styles from "./styles.module.css";

const BoardExcalidrawEditor = dynamic(
  () =>
    import("./BoardExcalidrawEditor").then((mod) => mod.BoardExcalidrawEditor),
  {
    ssr: false,
    loading: () => <BoardEditorSpinner />,
  },
);

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  board?: TBoard | null;
};

const BoardEditorSpinner: FC<{ size?: "md" | "lg" }> = ({ size = "md" }) => (
  <div className={styles.editorWrap}>
    <div className={styles.editorLoading}>
      <Spinner color="primary" size={size} />
    </div>
  </div>
);

const getSaveStatusLabel = (status: TBoardSaveStatus): string => {
  if (status === "idle") {
    return "";
  }

  const labelKey = BOARD_SAVE_STATUS_LABEL_KEY[status];
  return labelKey ? i18n.t(labelKey) : "";
};

export const BoardEditorModal: FC<TProps> = ({ isOpen, onClose, board }) => {
  const boardId = board?.id;
  const {
    saveStatus,
    initialData,
    contentRevision,
    isLoading,
    queueSave,
    flushSave,
  } = useBoardContent(boardId, isOpen);

  const handleClose = useCallback(async () => {
    await flushSave();
    onClose();
  }, [flushSave, onClose]);

  const statusLabel = useMemo(
    () => getSaveStatusLabel(saveStatus),
    [saveStatus],
  );

  const isEditorReady = !isLoading && !!initialData && !!boardId;

  return (
    <Modal
      isDismissable={false}
      hideCloseButton={false}
      size="5xl"
      isOpen={isOpen}
      onClose={handleClose}
      scrollBehavior="inside"
      placement="center"
      classNames={BOARD_EDITOR_MODAL_CLASS_NAMES}
    >
      <ModalContent>
        <ModalHeader>
          <p>{board?.title || <T k="boards.myBoards" />}</p>
        </ModalHeader>
        <ModalBody>
          {isEditorReady ? (
            <BoardExcalidrawEditor
              boardId={boardId}
              contentRevision={contentRevision}
              initialData={initialData}
              onSceneChange={queueSave}
            />
          ) : (
            <BoardEditorSpinner size="lg" />
          )}
          {!!statusLabel && (
            <div className={styles.statusBar}>
              <span>{statusLabel}</span>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
