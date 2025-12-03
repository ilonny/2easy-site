import {useCallback} from "react";
import {pasteHtmlAtCaret} from "@/app/editor/components/editor/FillGapsSelect/utils/pasteHtmlAtCaret";
import {TField, TFillGapsSelectData} from "../types";

/**
 * Hook для добавления нового пропуска из выделенного текста
 *
 * Функциональность:
 * - Берет выделенный в contentEditable тексту (selection)
 * - Генерирует уникальный ID на основе текущего времени
 * - Вставляет HTML-элемент пропуска (answerWrapper div) в место курсора
 * - Создает новое поле с одним вариантом ответа (выделенный текст)
 * - Обновляет состояние данных (dataText и fields)
 * - Очищает selection и убирает фокус с элемента
 *
 * Процесс вставки:
 * 1. <div class="answerWrapper"> - контейнер для пропуска
 * 2. contenteditable="false" - пользователь не может редактировать пропуск напрямую
 * 3. answer='[selected text]' - атрибут хранит исходный текст
 * 4. id=timestamp - уникальный ID для отслеживания
 *
 * @param {TFillGapsSelectData} data - Объект с данными упражнения
 * @param {Function} changeData - Функция для обновления данных
 * @returns {Function} Callback функция, принимающая объект { selection: string }
 *
 * @example
 * const onClickAddSelection = useAddSelection(data, changeData);
 * onClickAddSelection({ selection: "important word" });
 */
export const useAddSelection = (
    data: TFillGapsSelectData,
    changeData: <K extends keyof TFillGapsSelectData>(key: K, value: TFillGapsSelectData[K]) => void
) => {
    return useCallback(
        (addItemState: {selection: string}) => {
            // Генерируем уникальный ID для пропуска
            const id = new Date().getTime();

            // Вставляем HTML элемент пропуска в место курсора
            pasteHtmlAtCaret(
                `<div style="display: inline-block;" contenteditable="false" class="answerWrapper" id=${id} answer='[${addItemState.selection}]' />&nbsp;`
            );

            // Получаем контейнер с текстом
            const contentEditableWrapper = document.getElementById("contentEditableWrapper");

            // Очищаем текущее выделение (selection)
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }

            // Создаем новое поле (пропуск) с одним вариантом ответа
            const field = {
                id,
                options: [
                    {
                        isCorrect: true,
                        value: addItemState.selection,
                    },
                ],
                originalWord: addItemState.selection,
            } as TField;

            // Обновляем список полей
            const dataFields = [...data.fields];
            dataFields.push(field);

            // Сохраняем изменения в state
            changeData("fields", [...dataFields]);
            changeData("dataText", contentEditableWrapper?.innerHTML);
            contentEditableWrapper?.blur();
        },
        [changeData, data]
    );
};
