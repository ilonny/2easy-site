"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { TBoard, TLessonBoardScope } from "@/app/board/types";
import { useLessonBoard } from "@/app/board/hooks/useLessonBoard";
import { BoardEditorModal } from "@/app/board/components/BoardEditorModal";

type TProps = {
  lessonId: number;
  isTeacher: boolean;
  studentIdForBoard?: number;
};

const BoardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M8 20h8" />
    <path d="M12 18v2" />
    <path d="M7 9h10M7 12h6" />
  </svg>
);

export const LessonBoardButton: FC<TProps> = ({
  lessonId,
  isTeacher,
  studentIdForBoard,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [board, setBoard] = useState<TBoard | null>(null);
  const [scope, setScope] = useState<TLessonBoardScope | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const { fetchLessonBoardScope, fetchLessonBoard } = useLessonBoard();
  const { checkSubscription } = useCheckSubscription();

  const loadBoard = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!lessonId) {
        return null;
      }

      if (!options?.silent) {
        setIsOpening(true);
      }

      try {
        const scopeResponse = await fetchLessonBoardScope(
          lessonId,
          studentIdForBoard,
        );
        const lessonScope = scopeResponse.scope;
        setScope(lessonScope);

        if (lessonScope === "individual" && isTeacher && !studentIdForBoard) {
          if (!options?.silent) {
            toast(i18n.t("boards.selectStudentForBoard"), { type: "warning" });
          }
          return null;
        }

        const loadedBoard = await fetchLessonBoard(lessonId, studentIdForBoard);
        setBoard(loadedBoard);
        return loadedBoard;
      } catch {
        if (!options?.silent) {
          toast(i18n.t("boards.openBoardError"), { type: "error" });
        }
        return null;
      } finally {
        if (!options?.silent) {
          setIsOpening(false);
        }
      }
    },
    [
      fetchLessonBoard,
      fetchLessonBoardScope,
      isTeacher,
      lessonId,
      studentIdForBoard,
    ],
  );

  const handleOpen = useCallback(async () => {
    if (isTeacher && !checkSubscription()) {
      return;
    }
    const loadedBoard = await loadBoard();
    if (loadedBoard) {
      setIsOpen(true);
    }
  }, [checkSubscription, isTeacher, loadBoard]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen || scope !== "individual" || !isTeacher) {
      return;
    }

    void loadBoard({ silent: true });
  }, [isOpen, isTeacher, loadBoard, scope, studentIdForBoard]);

  return (
    <>
      <Button
        endContent={<BoardIcon />}
        color="primary"
        variant="light"
        onClick={() => void handleOpen()}
        size="lg"
        isLoading={isOpening}
        style={{ minWidth: 300 }}
      >
        <T k="boards.lessonBoard" />
      </Button>

      <BoardEditorModal
        isOpen={isOpen}
        onClose={handleClose}
        board={board}
        mode="realtime"
        isHost={isTeacher}
      />
    </>
  );
};
