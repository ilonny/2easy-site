"use client";

import {
  BOARD_CARD_FOOTER_MIN_HEIGHT,
  BOARD_CARD_IMAGE_HEIGHT,
} from "@/app/board/constants";
import { TBoard } from "@/app/board/types";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import { Button } from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
import { BoardCard } from "../BoardCard";
import { EditBoardModalForm } from "../EditBoardModalForm";
import { DeleteBoardModalForm } from "../DeleteBoardModalForm";
import { T } from "@/i18n/T";

type TProps = {
  boards: TBoard[];
  onPressCreate: () => void;
  onPressBoard: (board: TBoard) => void;
  getBoards: () => void;
};

export const BoardsList: FC<TProps> = ({
  boards,
  onPressCreate,
  onPressBoard,
  getBoards,
}) => {
  const [editIsVisible, setEditIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [chosenBoard, setChosenBoard] = useState<TBoard | null>(null);

  const onPressEdit = useCallback((board: TBoard) => {
    setChosenBoard(board);
    setEditIsVisible(true);
  }, []);

  const onPressDelete = useCallback((board: TBoard) => {
    setChosenBoard(board);
    setDeleteIsVisible(true);
  }, []);

  return (
    <>
      <div className="flex items-start justify-start w-full flex-wrap">
        <div className="p-2 w-[100%] md:w-1/2 lg:w-[25%]">
          <div
            className="image-wrapper"
            style={{
              width: "100%",
              height: BOARD_CARD_IMAGE_HEIGHT,
              position: "relative",
              overflow: "hidden",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `url(${Bg.src}) center center no-repeat #fff`,
                backgroundSize: "cover",
              }}
            />
          </div>
          <div
            className="p-4 bg-white flex items-center justify-center"
            style={{
              minHeight: BOARD_CARD_FOOTER_MIN_HEIGHT,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          >
            <Button
              color="primary"
              className="w-full flex-shrink-0 min-h-12 h-12"
              size="lg"
              onClick={onPressCreate}
            >
              <T k="boards.createBoard" />
            </Button>
          </div>
        </div>
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onPress={onPressBoard}
            onPressEdit={onPressEdit}
            onPressDelete={onPressDelete}
          />
        ))}
      </div>
      {!!chosenBoard && (
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
          <DeleteBoardModalForm
            isVisible={deleteIsVisible}
            setIsVisible={setDeleteIsVisible}
            board={chosenBoard}
            onSuccess={() => {
              setDeleteIsVisible(false);
              getBoards();
            }}
          />
        </>
      )}
    </>
  );
};
