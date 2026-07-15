"use client";

import { useCallback, useContext, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { AuthContext } from "@/auth";
import { withLogin } from "@/auth/hooks/withLogin";
import { useBoardEditorChrome } from "@/app/board/hooks/useBoardEditorChrome";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardEditorChrome } from "@/app/board/components/BoardEditorChrome";
import { BoardEditModeBanner } from "@/app/board/components/BoardEditModeBanner";
import { BoardParticipantsList } from "@/app/board/components/BoardParticipantsList";
import { BoardStartLessonButton } from "@/app/board/components/BoardStartLessonButton";
import { T } from "@/i18n/T";
import { Button } from "@nextui-org/react";

export default function BoardRealtimePage() {
  withLogin();
  const params = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, authIsLoading } = useContext(AuthContext);
  const boardId = Number(params.id || 0);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const authReady = !authIsLoading && !!profile;
  const isCatalogTeacherFlow =
    isTeacher && searchParams.get("catalog") === "1";

  const [isLessonMode, setIsLessonMode] = useState(false);
  const [boardApi, setBoardApi] = useState<ExcalidrawImperativeAPI | null>(
    null,
  );
  const isEditMode = isCatalogTeacherFlow && !isLessonMode;

  const { editor, isEditorReady, editorKey } =
    useBoardEditorChrome({
      boardId,
      mode: isEditMode ? "solo" : "realtime",
      enabled: boardId > 0 && authReady,
      isHost: isTeacher && !isEditMode,
      autoStartHostSession: !isCatalogTeacherFlow,
      closeSessionOnUnmount: !isCatalogTeacherFlow || isLessonMode,
      editorKeyPrefix: "board-page-editor",
    });

  const { board, loadError, leaveSession, flushSave } = editor;

  const handleClose = useCallback(() => {
    const close = async () => {
      if (isLessonMode) {
        await leaveSession();
      } else {
        await flushSave();
      }
    };

    void close().finally(() => {
      router.back();
    });
  }, [flushSave, isLessonMode, leaveSession, router]);

  const handleStartLesson = useCallback(() => {
    setIsLessonMode(true);
  }, []);

  const handleEndLesson = useCallback(() => {
    void leaveSession().finally(() => {
      setIsLessonMode(false);
    });
  }, [leaveSession]);

  const title = useMemo(
    () => board?.title || <T k="boards.myBoards" />,
    [board?.title],
  );

  if (loadError) {
    return (
      <div className="fixed inset-0 z-[2] flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p><T k="boards.loadError" /></p>
        <button type="button" onClick={handleClose}>
          <T k="common.back" defaultText="Назад" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2] flex flex-col bg-white">
      {isEditMode ? <BoardEditModeBanner /> : null}

      <div className="relative flex shrink-0 items-center gap-3 border-b border-default-200 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <p className="min-w-0 truncate font-medium">{title}</p>
          {isEditMode && board ? (
            <BoardStartLessonButton
              board={board}
              onLessonStarted={handleStartLesson}
            />
          ) : null}
          {isLessonMode && isCatalogTeacherFlow ? (
            <Button
              color="default"
              size="sm"
              variant="flat"
              className="shrink-0"
              onPress={handleEndLesson}
            >
              <T k="boards.endBoardLesson" />
            </Button>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center pr-10">
          {isTeacher ? (
            <BoardParticipantsList api={boardApi} cursors={editor.cursors} />
          ) : null}
        </div>
        <BoardCloseButton variant="header" onClick={handleClose} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {boardId ? (
          <BoardEditorChrome
            boardId={boardId}
            editorKey={editorKey}
            editor={editor}
            isEditorReady={isEditorReady}
            onApiChange={setBoardApi}
          />
        ) : null}
      </div>
    </div>
  );
}
