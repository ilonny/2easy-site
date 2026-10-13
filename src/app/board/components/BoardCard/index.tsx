"use client";

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
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import styles from "./styles.module.css";

type TProps = {
  board: TBoard;
  onPress: (board: TBoard) => void;
  onPressStartLesson?: (board: TBoard) => void;
  onPressEdit?: (board: TBoard) => void;
  onPressDelete?: (board: TBoard) => void;
  onPressAttach?: (board: TBoard) => void;
  onPressRemoveFromStudent?: (board: TBoard) => void;
  showAttachAction?: boolean;
  showStudentCabinetMenu?: boolean;
};

export const BoardCard: FC<TProps> = ({
  board,
  onPress,
  onPressStartLesson,
  onPressEdit,
  onPressDelete,
  onPressAttach,
  onPressRemoveFromStudent,
  showAttachAction = false,
  showStudentCabinetMenu = false,
}) => {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const showMenu =
    showStudentCabinetMenu ||
    (board.canEdit &&
      !!(onPressEdit || onPressDelete || (onPressAttach && showAttachAction)));

  return (
    <div
      className={`group flex w-full min-w-0 flex-col gap-3.5 ${styles.boardCard}`}
    >
      <div
        onClick={() => onPress(board)}
        className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-brand-gray lg:rounded-[30px]"
      >
        <div
          className={`absolute inset-0 ${styles.imageBg}`}
          style={{
            backgroundImage: `url(${
              board?.image_path ? getImageUrl(board.image_path) : Bg.src
            })`,
          }}
        />
        <div className={styles.menuShadow} />
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
                <Button
                  isIconOnly
                  variant="flat"
                  className="rounded-[14px] bg-brand-black/40 text-white backdrop-blur-md hover:!bg-brand-black/55"
                >
                  <Image src={Ellipse} alt="icon" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="items-start bg-white p-2">
                {showStudentCabinetMenu && !!onPressEdit && (
                  <Button
                    variant="light"
                    className="w-full justify-start px-2 py-1 text-left text-sm text-default-foreground"
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
                    className="w-full justify-start px-2 py-1 text-left text-sm text-default-foreground"
                    endContent={<Image src={DeleteIcon} alt="icon" />}
                    onPress={() => {
                      setPopoverIsOpen(false);
                      onPressRemoveFromStudent(board);
                    }}
                  >
                    <T k="lessons.deleteFromStudent" />
                  </Button>
                )}
                {!showStudentCabinetMenu &&
                  !!onPressAttach &&
                  showAttachAction && (
                    <Button
                      variant="light"
                      className="w-full justify-start px-2 py-1 text-left text-sm text-default-foreground"
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
                    className="w-full justify-start px-2 py-1 text-left text-sm text-default-foreground"
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
                    className="w-full justify-start px-2 py-1 text-left text-sm text-default-foreground"
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
      <div className="flex flex-col gap-3">
        <div onClick={() => onPress(board)} className="cursor-pointer">
          <p className="text-sm font-bold leading-[1.3] tracking-brand text-brand-black lg:text-base lg:leading-[22px]">
            {board.title}
          </p>
          {!!board.description && (
            <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm font-bold leading-[1.3] tracking-brand text-brand-grayFont lg:line-clamp-3">
              {board.description.length > 100
                ? `${board.description.slice(0, 110)}...`
                : board.description}
            </p>
          )}
        </div>
        {!!onPressStartLesson ? (
          <Button
            className={brandPrimaryBtnClassName}
            size="md"
            onPress={() => onPressStartLesson(board)}
          >
            <T k="boards.startBoardLesson" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
