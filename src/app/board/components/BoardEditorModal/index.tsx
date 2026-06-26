"use client";

import { TBoard } from "@/app/board/types";
import { useBoardContent } from "@/app/board/hooks/useBoardContent";
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
    loading: () => (
      <div className={styles.editorWrap}>
        <div className="w-full h-full flex items-center justify-center">
          <Spinner color="primary" />
        </div>
      </div>
    ),
  },
);

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  board?: TBoard | null;
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

  const statusLabel = useMemo(() => {
    if (saveStatus === "loading") {
      return i18n.t("boards.loading");
    }
    if (saveStatus === "saving") {
      return i18n.t("boards.saving");
    }
    if (saveStatus === "saved") {
      return i18n.t("boards.saved");
    }
    if (saveStatus === "error") {
      return i18n.t("boards.saveError");
    }
    return "";
  }, [saveStatus]);

  return (
    <Modal
      isDismissable={false}
      hideCloseButton={false}
      size="5xl"
      isOpen={isOpen}
      onClose={handleClose}
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[92dvh] max-w-[1280px] w-[min(100%,1280px)] mx-auto my-2 sm:my-4",
        body: "pb-4",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <p>{board?.title || <T k="boards.myBoards" />}</p>
        </ModalHeader>
        <ModalBody>
          {isLoading || !initialData || !boardId ? (
            <div className={styles.editorWrap}>
              <div className="w-full h-full flex items-center justify-center">
                <Spinner color="primary" size="lg" />
              </div>
            </div>
          ) : (
            <BoardExcalidrawEditor
              boardId={boardId}
              contentRevision={contentRevision}
              initialData={initialData}
              onSceneChange={queueSave}
            />
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
