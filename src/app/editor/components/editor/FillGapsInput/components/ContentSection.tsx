"use client";
import { FC, RefObject } from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import InfoIcon from "@/assets/icons/info.svg";
import { AddItemCard } from "../../AddItemCard";
import styles from "../styles.module.css";

type Props = {
  contentEditableRef: RefObject<HTMLDivElement>;
  onChangeText: (text: string) => void;
  onClickAddSelection: (addItemState: { selection: string; left?: number; top?: number }) => void;
};

export const ContentSection: FC<Props> = ({
  contentEditableRef,
  onChangeText,
  onClickAddSelection,
}) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-light">Введите текст задания</p>
        <Tooltip
          content="Выделите в тексте слово, которое хотите пропустить. Нажмите на стрелку, чтобы добавить другие варианты."
          classNames={{
            base: ["before:bg-neutral-400 dark:before:bg-white"],
            content: [
              "py-2 px-4 shadow-xl",
              "text-black bg-white max-w-[255px]",
            ],
          }}
          placement="right-end"
          color="foreground"
        >
          <Image src={InfoIcon} alt="InfoIcon" />
        </Tooltip>
      </div>
      <div className="relative">
        <div
          suppressContentEditableWarning
          contentEditable
          id={'contentEditableWrapper'}
          className={`p-4 bg-white rounded-[20px] contentEditable ${styles["contentEditable"]}`}
          onBlur={(e) => onChangeText(e.currentTarget.innerHTML || "")}
          ref={contentEditableRef}
        ></div>
        <AddItemCard onClickAddSelection={onClickAddSelection} />
      </div>
    </>
  );
};
