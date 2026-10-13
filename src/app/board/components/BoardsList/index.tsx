"use client";

import { TBoard } from "@/app/board/types";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import { Button } from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
import { BoardCard } from "../BoardCard";
import { EditBoardModalForm } from "../EditBoardModalForm";
import { DeleteBoardModalForm } from "../DeleteBoardModalForm";
import { AttachBoardModalForm } from "../AttachBoardModalForm";
import { T } from "@/i18n/T";
import { brandPrimaryBtnClassName } from "@/components/brandUi";

type TProps = {
  boards: TBoard[];
  onPressCreate: () => void;
  onPressBoard: (board: TBoard) => void;
  onStartBoardLesson?: (board: TBoard) => void;
  getBoards: () => void;
  showTeacherActions?: boolean;
  showStudentCabinetActions?: boolean;
  deleteBoardRelation?: (relationId?: number) => void;
};

export const BoardsList: FC<TProps> = ({
  boards,
  onPressCreate,
  onPressBoard,
  onStartBoardLesson,
  getBoards,
  showTeacherActions = false,
  showStudentCabinetActions = false,
  deleteBoardRelation,
}) => {
  const [editIsVisible, setEditIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [attachIsVisible, setAttachIsVisible] = useState(false);
  const [chosenBoard, setChosenBoard] = useState<TBoard | null>(null);

  const onPressEdit = useCallback((board: TBoard) => {
    setChosenBoard(board);
    setEditIsVisible(true);
  }, []);

  const onPressDelete = useCallback((board: TBoard) => {
    setChosenBoard(board);
    setDeleteIsVisible(true);
  }, []);

  const onPressAttach = useCallback((board: TBoard) => {
    setChosenBoard(board);
    setAttachIsVisible(true);
  }, []);

  const onPressRemoveFromStudent = useCallback(
    (board: TBoard) => {
      deleteBoardRelation?.(board["board_relations.id"]);
    },
    [deleteBoardRelation],
  );

  return (
    <>
      <div className="mx-auto grid w-full max-w-full grid-cols-1 gap-x-3 gap-y-6 max-[1199px]:w-[80%] md:grid-cols-3 md:gap-x-4 md:gap-y-8 min-[1200px]:w-full min-[1200px]:grid-cols-4 min-[1200px]:gap-x-[30px] min-[1200px]:gap-y-10">
        {showTeacherActions && (
          <div className="flex w-full min-w-0 flex-col gap-3.5">
            <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-brand-gray lg:rounded-[30px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${Bg.src})` }}
              />
            </div>
            <Button
              className={brandPrimaryBtnClassName}
              size="lg"
              onClick={onPressCreate}
            >
              <T k="boards.createBoard" />
            </Button>
          </div>
        )}
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onPress={onPressBoard}
            onPressStartLesson={onStartBoardLesson}
            onPressEdit={
              showTeacherActions || showStudentCabinetActions
                ? onPressEdit
                : undefined
            }
            onPressDelete={showTeacherActions ? onPressDelete : undefined}
            onPressAttach={showTeacherActions ? onPressAttach : undefined}
            onPressRemoveFromStudent={
              showStudentCabinetActions ? onPressRemoveFromStudent : undefined
            }
            showAttachAction={showTeacherActions}
            showStudentCabinetMenu={showStudentCabinetActions}
          />
        ))}
      </div>
      {!!chosenBoard && (showTeacherActions || showStudentCabinetActions) && (
        <>
          <EditBoardModalForm
            isVisible={editIsVisible}
            setIsVisible={setEditIsVisible}
            board={chosenBoard}
            onSuccess={() => {
              setEditIsVisible(false);
              getBoards();
            }}
          />
          {showTeacherActions && (
            <>
              <DeleteBoardModalForm
                isVisible={deleteIsVisible}
                setIsVisible={setDeleteIsVisible}
                board={chosenBoard}
                onSuccess={() => {
                  setDeleteIsVisible(false);
                  getBoards();
                }}
              />
              <AttachBoardModalForm
                isVisible={attachIsVisible}
                setIsVisible={setAttachIsVisible}
                board={chosenBoard}
                onSuccess={() => {
                  setAttachIsVisible(false);
                  getBoards();
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
};
