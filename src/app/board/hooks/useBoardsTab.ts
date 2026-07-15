"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { checkResponse, fetchPostJson } from "@/api";
import { AuthContext } from "@/auth";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { TBoard } from "../types";
import { useBoards } from "./useBoards";

const filterBoardsBySearch = (boards: TBoard[], searchString?: string) => {
  if (!searchString) {
    return boards;
  }

  const query = searchString.toLowerCase();
  return boards.filter((board) => {
    return (
      board.title?.toLowerCase()?.includes(query) ||
      board.description?.toLowerCase()?.includes(query) ||
      board.tags?.toLowerCase()?.includes(query)
    );
  });
};

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
  const filteredBoards = useMemo(
    () => filterBoardsBySearch(boards, filterSearchString),
    [boards, filterSearchString],
  );

  const [createBoardModalIsVisible, setCreateBoardModalIsVisible] =
    useState(false);

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
        router.push(`/board/${board.id}`);
        return;
      }
      if (isTeacher) {
        router.push(`/board/${board.id}?catalog=1`);
      }
    },
    [isTeacher, profile?.isStudent, router, studentId],
  );

  const deleteBoardRelation = useCallback(
    async (relationId?: number) => {
      if (!relationId) {
        return;
      }

      const res = await fetchPostJson({
        path: "/board-relation/delete",
        isSecure: true,
        data: {
          relation_id: relationId,
        },
      });
      const data = await res?.json();
      checkResponse(data);
      await getBoards();
    },
    [getBoards],
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
    openCreateBoardModal,
    onCreateBoard,
    onPressBoard,
    deleteBoardRelation,
  };
};
