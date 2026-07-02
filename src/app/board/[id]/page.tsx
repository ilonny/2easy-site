"use client";

import { useCallback, useContext, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/auth";
import { withLogin } from "@/auth/hooks/withLogin";
import { useBoardEditorChrome } from "@/app/board/hooks/useBoardEditorChrome";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardEditorChrome } from "@/app/board/components/BoardEditorChrome";
import { T } from "@/i18n/T";

export default function BoardRealtimePage() {
  withLogin();
  const params = useParams() as { id: string };
  const router = useRouter();
  const { profile, authIsLoading } = useContext(AuthContext);
  const boardId = Number(params.id || 0);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const authReady = !authIsLoading && !!profile;

  const { editor, statusLabel, isEditorReady, editorKey, editorAreaStyle } =
    useBoardEditorChrome({
      boardId,
      mode: "realtime",
      enabled: boardId > 0 && authReady,
      isHost: isTeacher,
      editorKeyPrefix: "board-page-editor",
    });

  const { board, loadError, leaveSession } = editor;

  const handleClose = useCallback(() => {
    void leaveSession().finally(() => {
      router.back();
    });
  }, [leaveSession, router]);

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
      <div className="relative flex shrink-0 items-center border-b border-default-200 px-4 py-3 sm:px-6">
        <p className="pr-10 font-medium">{title}</p>
        <BoardCloseButton variant="header" onClick={handleClose} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col" style={editorAreaStyle}>
        {boardId ? (
          <BoardEditorChrome
            boardId={boardId}
            editorKey={editorKey}
            editor={editor}
            isEditorReady={isEditorReady}
            statusLabel={statusLabel}
            isHost={isTeacher}
          />
        ) : null}
      </div>
    </div>
  );
}
