"use client";
import React from "react";
import { AddItemCard } from "../../AddItemCard";
import Image from "next/image";
import InfoIcon from "@/assets/icons/info.svg";
import { Tooltip } from "@nextui-org/react";

/**
 * Компонент EditorArea
 *
 * Основной редактор текста для создания пропусков.
 *
 * Функциональность:
 * - contentEditable div для редактирования текста
 * - Пользователь выделяет слово и нажимает на кнопку "Добавить пропуск"
 * - Каждый пропуск отображается как answerWrapper элемент внутри contentEditable
 * - AddItemCard компонент позволяет добавлять выделенный текст как новый пропуск
 *
 * Структура:
 * 1. Заголовок с подсказкой (tooltip)
 * 2. ContentEditable контейнер для редактирования текста
 * 3. AddItemCard для выбора и добавления пропусков
 *
 * Взаимодействие:
 * - Пользователь выделяет текст в contentEditable
 * - Нажимает стрелку в AddItemCard
 * - Выделенный текст превращается в пропуск (answerWrapper div)
 * - Срабатывает callback onClickAddSelection
 * - Изменения текста отслеживаются через onChangeText
 */
type TProps = {
  /** Callback при добавлении нового пропуска */
  onClickAddSelection: (s: any) => void;
  /** Callback при изменении текста в редакторе */
  onChangeText: (t: string) => void;
  /** Ref на contentEditable элемент */
  contentEditableRef: any;
  /** CSS модуль для стилизации */
  styles: any;
};

export const EditorArea: React.FC<TProps> = ({
  onClickAddSelection,
  onChangeText,
  contentEditableRef,
  styles,
}) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-light">Введите текст задания</p>
        <Tooltip
          content="Выделите в тексте слово, которое хотите пропустить. Нажмите на стрелку, чтобы добавить другие варианты."
          classNames={{
            base: ["before:bg-neutral-400 dark:before:bg-white"],
            content: ["py-2 px-4 shadow-xl", "text-black bg-white max-w-[255px]"],
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
          id="contentEditableWrapper"
          className={`p-4 contentEditable ${styles["contentEditable"]}`}
          style={{ borderRadius: 20, background: "#fff" }}
          onBlur={(e) => onChangeText(e.currentTarget.innerHTML || "")}
          ref={contentEditableRef}
        ></div>
        <AddItemCard onClickAddSelection={onClickAddSelection} />
      </div>
    </>
  );
};

export default EditorArea;
