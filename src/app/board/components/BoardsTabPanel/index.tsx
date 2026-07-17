"use client";

import { TBoard } from "@/app/board/types";
import { BoardsList } from "@/app/board/components/BoardsList";
import { CreateBoardModalForm } from "@/app/board/components/CreateBoardModalForm";
import { FC } from "react";

type TProps = {
  boards: TBoard[];
  isLoading: boolean;
  isActive: boolean;
  hasCurrentCourse: boolean;
  studentId?: string;
  isTeacher: boolean;
  onPressCreate: () => void;
  onPressBoard: (board: TBoard) => void;
  onStartBoardLesson?: (board: TBoard) => void;
  getBoards: () => Promise<TBoard[] | unknown[]>;
  createBoardModalIsVisible: boolean;
  setCreateBoardModalIsVisible: (value: boolean) => void;
  onCreateBoard: (boardId: number) => void;
  deleteBoardRelation?: (relationId?: number) => void;
};

export const BoardsTabPanel: FC<TProps> = ({
  boards,
  isLoading,
  isActive,
  hasCurrentCourse,
  studentId,
  isTeacher,
  onPressCreate,
  onPressBoard,
  onStartBoardLesson,
  getBoards,
  createBoardModalIsVisible,
  setCreateBoardModalIsVisible,
  onCreateBoard,
  deleteBoardRelation,
}) => {
  const showPanelContent = isActive && !hasCurrentCourse && !isLoading;

  return (
    <>
      {showPanelContent ? (
        <BoardsList
          boards={boards}
          onPressCreate={isTeacher && !studentId ? onPressCreate : () => {}}
          onPressBoard={onPressBoard}
          onStartBoardLesson={onStartBoardLesson}
          getBoards={getBoards}
          showTeacherActions={isTeacher && !studentId}
          showStudentCabinetActions={isTeacher && !!studentId}
          deleteBoardRelation={deleteBoardRelation}
        />
      ) : null}

      <CreateBoardModalForm
        isVisible={createBoardModalIsVisible}
        setIsVisible={setCreateBoardModalIsVisible}
        onSuccess={onCreateBoard}
      />
    </>
  );
};
