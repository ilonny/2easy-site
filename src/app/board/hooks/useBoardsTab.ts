"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/auth";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { TBoard } from "../types";
import { useBoards } from "./useBoards";
import { useFilteredBoards } from "./useFilteredBoards";

type TTabIndex =
  | "userLessons"
  | "savedLessons"
  | "userCourses"
  | "2easyCourses"
  | "userBoards";

type TStudentTabIndex = "lessons" | "courses" | "boards";

type TParams = {
  studentId?: string;
  isTeacher: boolean;
  tabIndex: TTabIndex;
  setTabIndex: (value: TTabIndex) => void;
  studentTabIndex: TStudentTabIndex;
  setStudentTabIndex: (value: TStudentTabIndex) => void;
  filterSearchString: string;
};

export const useBoardsTab = ({
  studentId,
  isTeacher,
  tabIndex,
  setTabIndex,
  studentTabIndex,
  setStudentTabIndex,
  filterSearchString,
}: TParams) => {
  const router = useRouter();
  const { profile } = useContext(AuthContext);
  const { checkSubscription } = useCheckSubscription();

  const boardsStudentId = studentId
    ? Number(studentId)
    : profile?.isStudent
      ? Number(profile.studentId || 0) || undefined
      : undefined;

  const { boards, boardsIsLoading, getBoards } = useBoards(boardsStudentId);
  const filteredBoards = useFilteredBoards(boards, filterSearchString);

  const [createBoardModalIsVisible, setCreateBoardModalIsVisible] =
    useState(false);
  const [boardEditorOpen, setBoardEditorOpen] = useState(false);
  const [editorBoard, setEditorBoard] = useState<TBoard | null>(null);

  const isBoardsTabActive =
    tabIndex === "userBoards" ||
    (!!studentId && studentTabIndex === "boards");

  const showBoardsTabButton =
    (isTeacher && !studentId && boards.length > 0) ||
    (!!boardsStudentId && boards.length > 0);

  useEffect(() => {
    if (isTeacher && !studentId) {
      void getBoards();
      return;
    }
    if (boardsStudentId) {
      void getBoards();
    }
  }, [boardsStudentId, getBoards, isTeacher, studentId]);

  useEffect(() => {
    if (tabIndex === "userBoards" && !boards.length && !boardsIsLoading) {
      setTabIndex("userLessons");
    }
  }, [boards.length, boardsIsLoading, setTabIndex, tabIndex]);

  useEffect(() => {
    if (
      studentId &&
      studentTabIndex === "boards" &&
      !boards.length &&
      !boardsIsLoading
    ) {
      setStudentTabIndex("lessons");
    }
  }, [
    boards.length,
    boardsIsLoading,
    setStudentTabIndex,
    studentId,
    studentTabIndex,
  ]);

  const openCreateBoardModal = useCallback(() => {
    if (checkSubscription()) {
      setCreateBoardModalIsVisible(true);
    }
  }, [checkSubscription]);

  const onCreateBoard = useCallback(
    async (_boardId: number) => {
      setCreateBoardModalIsVisible(false);
      await getBoards();
      setTabIndex("userBoards");
    },
    [getBoards, setTabIndex],
  );

  const onPressBoard = useCallback(
    (board: TBoard) => {
      if (studentId || profile?.isStudent) {
        router.push(`/boards/${board.id}`);
        return;
      }
      setEditorBoard(board);
      setBoardEditorOpen(true);
    },
    [profile?.isStudent, router, studentId],
  );

  return {
    boards,
    boardsIsLoading,
    filteredBoards,
    getBoards,
    isBoardsTabActive,
    showBoardsTabButton,
    createBoardModalIsVisible,
    setCreateBoardModalIsVisible,
    boardEditorOpen,
    setBoardEditorOpen,
    editorBoard,
    openCreateBoardModal,
    onCreateBoard,
    onPressBoard,
  };
};
