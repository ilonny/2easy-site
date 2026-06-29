"use client";

import { useCallback, useContext, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/auth";
import { withLogin } from "@/auth/hooks/withLogin";
import { useBoard } from "@/app/board/hooks/useBoard";
import { useBoardEditor } from "@/app/board/hooks/useBoardEditor";
import { BOARD_EDITOR_JIVO_OFFSET_PX } from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardEditorShell } from "@/app/board/components/BoardEditorShell";
import { getBoardSaveStatusLabel } from "@/app/board/utils/saveStatus";
import { T } from "@/i18n/T";

export default function BoardRealtimePage() {
  withLogin();
  const params = useParams() as { id: string };
  const router = useRouter();
  const { profile, authIsLoading } = useContext(AuthContext);
  const boardId = Number(params.id || 0);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const authReady = !authIsLoading && !!profile;

  const { board, loadError } = useBoard(boardId);
  const editor = useBoardEditor({
    boardId,
    mode: "realtime",
    enabled: boardId > 0 && authReady,
    isHost: isTeacher,
  });

  const {
    saveStatus,
    initialData,
    contentRevision,
    isWaitingForHost,
    queueSave,
    leaveSession,
  } = editor;

  const handleClose = useCallback(() => {
    void leaveSession().finally(() => {
      router.back();
    });
  }, [leaveSession, router]);

  const statusLabel = useMemo(
    () => getBoardSaveStatusLabel(saveStatus),
    [saveStatus],
  );

  if (loadError) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p><T k="boards.loadError" /></p>
        <button type="button" onClick={handleClose}>
          <T k="common.back" defaultText="Назад" />
        </button>
      </div>
    );
  }

  const isEditorReady = !!initialData && !!boardId && !isWaitingForHost;

  return (
    <div
      className="flex h-[100dvh] flex-col bg-white"
      style={{ paddingBottom: BOARD_EDITOR_JIVO_OFFSET_PX }}
    >
      <div className="relative flex shrink-0 items-center border-b border-default-200 px-4 py-3 sm:px-6">
        <p className="pr-10 font-medium">
          {board?.title || <T k="boards.myBoards" />}
        </p>
        <BoardCloseButton variant="header" onClick={handleClose} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {boardId && initialData ? (
          <BoardEditorShell
            boardId={boardId}
            editorKey={`board-page-editor-${boardId}`}
            contentRevision={contentRevision}
            initialData={initialData}
            isWaitingForHost={isWaitingForHost}
            isEditorReady={isEditorReady}
            syncMode="realtime"
            statusLabel={statusLabel}
            onSceneChange={queueSave}
            waitingText={<T k="boards.waitingForHost" />}
          />
        ) : null}
      </div>
    </div>
  );
}
