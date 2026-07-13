"use client";

import { BOARD_CARD_FOOTER_MIN_HEIGHT, BOARD_CARD_IMAGE_HEIGHT } from "@/app/board/constants";
import { TBoard } from "@/app/board/types";
import { getImageUrl } from "@/app/editor/helpers";
import Ellipse from "@/assets/icons/ellipse.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import Image from "next/image";
import { FC, useState } from "react";
import { T } from "@/i18n/T";
import { StartBoardButton } from "../StartBoardButton";
import styles from "./styles.module.css";

type TProps = {
  board: TBoard;
  onPress: (board: TBoard) => void;
  onPressEdit?: (board: TBoard) => void;
  onPressDelete?: (board: TBoard) => void;
  onPressAttach?: (board: TBoard) => void;
  onPressRemoveFromStudent?: (board: TBoard) => void;
  showStartBoardButton?: boolean;
  showAttachAction?: boolean;
  showStudentCabinetMenu?: boolean;
};

export const BoardCard: FC<TProps> = ({
  board,
  onPress,
  onPressEdit,
  onPressDelete,
  onPressAttach,
  onPressRemoveFromStudent,
  showStartBoardButton = false,
  showAttachAction = false,
  showStudentCabinetMenu = false,
}) => {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const showMenu =
    showStudentCabinetMenu ||
    (board.canEdit &&
      !!(onPressEdit || onPressDelete || (onPressAttach && showAttachAction)));

  return (
    <div className={`p-2 w-[100%] md:w-1/2 lg:w-[25%] ${styles.boardCard}`}>
      <div
        onClick={() => onPress(board)}
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
          className={styles.imageBg}
          style={{
            background: `url(${
              board?.image_path ? getImageUrl(board.image_path) : Bg.src
            })`,
          }}
        />
        <div className={styles.shadow} />
        {showMenu && (
          <div
            className={styles.btnWrapper}
            onClick={(event) => event.stopPropagation()}
          >
            <Popover
              placement="bottom-end"
              isOpen={popoverIsOpen}
              onOpenChange={setPopoverIsOpen}
            >
              <PopoverTrigger>
                <Button isIconOnly variant="flat">
                  <Image src={Ellipse} alt="icon" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-white p-2 items-start">
                {showStudentCabinetMenu && !!onPressEdit && (
                  <Button
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 text-left justify-start"
                    style={{ fontSize: 14 }}
                    onPress={() => {
                      setPopoverIsOpen(false);
                      onPressEdit(board);
                    }}
                  >
                    <T k="boards.editBoard" />
                  </Button>
                )}
                {showStudentCabinetMenu && !!onPressRemoveFromStudent && (
                  <Button
                    size="sm"
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 justify-start"
                    style={{ fontSize: 14 }}
                    endContent={<Image src={DeleteIcon} alt="icon" />}
                    onPress={() => {
                      setPopoverIsOpen(false);
                      onPressRemoveFromStudent(board);
                    }}
                  >
                    <T k="lessons.deleteFromStudent" />
                  </Button>
                )}
                {!showStudentCabinetMenu && !!onPressAttach && showAttachAction && (
                  <Button
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 text-left justify-start"
                    style={{ fontSize: 14 }}
                    onPress={() => {
                      setPopoverIsOpen(false);
                      onPressAttach(board);
                    }}
                  >
                    <T k="boards.attachToStudent" />
                  </Button>
                )}
                {!showStudentCabinetMenu && !!onPressEdit && (
                  <Button
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 text-left justify-start"
                    style={{ fontSize: 14 }}
                    onPress={() => {
                      setPopoverIsOpen(false);
                      onPressEdit(board);
                    }}
                  >
                    <T k="boards.editBoard" />
                  </Button>
                )}
                {!showStudentCabinetMenu && !!onPressDelete && (
                  <Button
                    size="sm"
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 justify-start"
                    style={{ fontSize: 14 }}
                    endContent={<Image src={DeleteIcon} alt="icon" />}
                    onPress={() => {
                      setPopoverIsOpen(false);
                      onPressDelete(board);
                    }}
                  >
                    <T k="boards.deleteBoard" />
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      <div
        className="p-4 bg-white flex flex-col gap-3"
        style={{
          minHeight: BOARD_CARD_FOOTER_MIN_HEIGHT,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      >
        <div onClick={() => onPress(board)} className="cursor-pointer">
          <p className="text-black font-bold" style={{ fontSize: 18 }}>
            {board.title}
          </p>
          {!!board.description && (
            <div className="mt-2" style={{ whiteSpace: "break-spaces", fontSize: 14 }}>
              {board.description.length > 100
                ? `${board.description.slice(0, 110)}...`
                : board.description}
            </div>
          )}
        </div>
        {showStartBoardButton && board.canEdit && (
          <StartBoardButton board={board} />
        )}
      </div>
    </div>
  );
};
