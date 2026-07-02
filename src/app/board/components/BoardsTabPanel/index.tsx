"use client";

import { TBoard } from "@/app/board/types";
import { BoardsList } from "@/app/board/components/BoardsList";
import { CreateBoardModalForm } from "@/app/board/components/CreateBoardModalForm";
import { BoardEditorModal } from "@/app/board/components/BoardEditorModal";
import { Input } from "@nextui-org/react";
import Image from "next/image";
import Loupe from "@/assets/icons/loupe.svg";
import { FC } from "react";
import { useTranslation } from "react-i18next";

type TProps = {
  boards: TBoard[];
  isLoading: boolean;
  isActive: boolean;
  hasCurrentCourse: boolean;
  studentId?: string;
  isTeacher: boolean;
  filterSearchString: string;
  onFilterSearchChange: (value: string) => void;
  showStudentSearch: boolean;
  onPressCreate: () => void;
  onPressBoard: (board: TBoard) => void;
  getBoards: () => Promise<TBoard[] | unknown[]>;
  createBoardModalIsVisible: boolean;
  setCreateBoardModalIsVisible: (value: boolean) => void;
  onCreateBoard: (boardId: number) => void;
  boardEditorOpen: boolean;
  setBoardEditorOpen: (value: boolean) => void;
  editorBoard: TBoard | null;
};

export const BoardsTabPanel: FC<TProps> = ({
  boards,
  isLoading,
  isActive,
  hasCurrentCourse,
  studentId,
  isTeacher,
  filterSearchString,
  onFilterSearchChange,
  showStudentSearch,
  onPressCreate,
  onPressBoard,
  getBoards,
  createBoardModalIsVisible,
  setCreateBoardModalIsVisible,
  onCreateBoard,
  boardEditorOpen,
  setBoardEditorOpen,
  editorBoard,
}) => {
  const { t } = useTranslation();

  const showPanelContent = isActive && !hasCurrentCourse && !isLoading;

  return (
    <>
      {showPanelContent ? (
        <>
          {showStudentSearch ? (
            <>
              <div className="w-full max-w-[525px] m-auto min-w-0 px-0">
                <Input
                  value={filterSearchString}
                  onValueChange={onFilterSearchChange}
                  placeholder={t("boards.searchBoards")}
                  size="lg"
                  classNames={{ inputWrapper: "bg-white hove min-w-0" }}
                  startContent={
                    <Image
                      src={Loupe.src}
                      alt="search"
                      width={18}
                      height={18}
                      style={{ borderRadius: 0 }}
                    />
                  }
                />
              </div>
              <div className="h-10" />
            </>
          ) : null}

          <BoardsList
            boards={boards}
            onPressCreate={isTeacher && !studentId ? onPressCreate : () => {}}
            onPressBoard={onPressBoard}
            getBoards={getBoards}
            showTeacherActions={isTeacher && !studentId}
            showStartBoardButton={isTeacher && !studentId}
          />
        </>
      ) : null}

      <CreateBoardModalForm
        isVisible={createBoardModalIsVisible}
        setIsVisible={setCreateBoardModalIsVisible}
        onSuccess={onCreateBoard}
      />
      <BoardEditorModal
        isOpen={boardEditorOpen}
        onClose={() => setBoardEditorOpen(false)}
        board={editorBoard}
      />
    </>
  );
};
