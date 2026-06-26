"use client";

import { TBoard } from "@/app/board/types";
import { getImageUrl } from "@/app/editor/helpers";
import Ellipse from "@/assets/icons/ellipse.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import EditIcon from "@/assets/icons/edit.svg";
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

type TProps = {
  board: TBoard;
  onPress: (board: TBoard) => void;
  onPressEdit?: (board: TBoard) => void;
  onPressDelete?: (board: TBoard) => void;
};

export const BoardCard: FC<TProps> = ({
  board,
  onPress,
  onPressEdit,
  onPressDelete,
}) => {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);

  return (
    <div className="p-2 w-[100%] md:w-1/2 lg:w-[25%]">
      <div
        className="cursor-pointer"
        onClick={() => onPress(board)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPress(board);
          }
        }}
      >
        <div
          className="image-wrapper"
          style={{
            width: "100%",
            height: 317,
            position: "relative",
            overflow: "hidden",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <div
            style={{
              width: "104%",
              height: "104%",
              background: `url(${
                board?.image_path ? getImageUrl(board.image_path) : Bg.src
              }) center center no-repeat #fff`,
              backgroundSize: "cover",
            }}
          />
          {board.canEdit && (
            <Popover
              placement="bottom-end"
              isOpen={popoverIsOpen}
              onOpenChange={setPopoverIsOpen}
            >
              <PopoverTrigger>
                <button
                  type="button"
                  className="absolute top-3 right-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image src={Ellipse.src} alt="menu" width={24} height={24} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="bg-white p-2 items-start">
                {!!onPressEdit && (
                  <Button
                    variant="light"
                    className="justify-start w-full"
                    startContent={
                      <Image src={EditIcon.src} alt="edit" width={16} height={16} />
                    }
                    onPress={() => {
                      setPopoverIsOpen(false);
                      onPressEdit(board);
                    }}
                  >
                    <T k="boards.editBoard" />
                  </Button>
                )}
                {!!onPressDelete && (
                  <Button
                    variant="light"
                    color="danger"
                    className="justify-start w-full"
                    startContent={
                      <Image src={DeleteIcon.src} alt="delete" width={16} height={16} />
                    }
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
          )}
        </div>
        <div
          className="p-4 bg-white"
          style={{
            minHeight: 100,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
          }}
        >
          <p className="font-medium text-lg line-clamp-2">{board.title}</p>
          {!!board.description && (
            <p className="text-sm text-default-500 mt-2 line-clamp-3">
              {board.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
