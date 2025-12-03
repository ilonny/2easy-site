import {useCallback, useMemo} from "react";
import {TFillGapsSelectData} from "../types";

/**
 * @typedef {Object} FieldMutationHandlers
 * @property {(fieldId: number, optionIndex: number) => void} toggleOption - Переключает флаг isCorrect для опции
 * @property {(fieldId: number, optionIndex: number, value: string) => void} updateOptionValue - Обновляет текст опции
 * @property {(fieldId: number) => void} addOption - Добавляет новую опцию к пропуску
 * @property {(fieldId: number, optionIndex: number) => void} removeOption - Удаляет опцию из пропуска
 */
type FieldMutationHandlers = {
    toggleOption: (fieldId: number, optionIndex: number) => void;
    updateOptionValue: (fieldId: number, optionIndex: number, value: string) => void;
    addOption: (fieldId: number) => void;
    removeOption: (fieldId: number, optionIndex: number) => void;
};

/**
 * Hook для управления мутациями полей пропусков
 *
 * Предоставляет функции для изменения опций (вариантов ответов) в каждом пропуске:
 * - Переключение правильного ответа
 * - Редактирование текста варианта ответа
 * - Добавление новых вариантов
 * - Удаление вариантов ответов
 *
 * Использует useMemo для оптимизации, чтобы избежать лишних перерисовок подкомпонентов.
 *
 * @param {TFillGapsSelectData} data - Объект с данными упражнения
 * @param {Function} changeData - Функция для обновления данных в state
 * @returns {Object} Объект с callback-функциями для работы с опциями
 * @returns {Function} returns.onChangeFieldOption - Переключить правильность ответа
 * @returns {Function} returns.onChangeFieldValue - Изменить текст варианта ответа
 * @returns {Function} returns.onAddFieldOption - Добавить новый вариант ответа
 * @returns {Function} returns.deleteOption - Удалить вариант ответа
 */
export const useFieldMutations = (
    data: TFillGapsSelectData,
    changeData: <K extends keyof TFillGapsSelectData>(key: K, value: TFillGapsSelectData[K]) => void
) => {
    const fieldMutationHandlers = useMemo<FieldMutationHandlers>(
        () => ({
            /**
             * Переключает флаг isCorrect для опции (делает её правильным/неправильным ответом)
             */
            toggleOption: (fieldId: number, optionIndex: number) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options[optionIndex].isCorrect = !field.options[optionIndex].isCorrect;
                changeData("fields", dataFields);
            },
            /**
             * Обновляет текст варианта ответа
             */
            updateOptionValue: (fieldId: number, optionIndex: number, value: string) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options[optionIndex].value = value;
                changeData("fields", dataFields);
            },
            /**
             * Добавляет новую опцию (вариант ответа) к пропуску
             */
            addOption: (fieldId: number) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options.push({value: "", isCorrect: false});
                changeData("fields", dataFields);
            },
            /**
             * Удаляет опцию из пропуска по индексу
             */
            removeOption: (fieldId: number, optionIndex: number) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options = field.options.filter((_o, i) => i !== optionIndex);
                changeData("fields", dataFields);
            },
        }),
        [data.fields, changeData]
    );

    const onChangeFieldOption = useCallback(
        (fieldId: number, optionIndex: number) => fieldMutationHandlers.toggleOption(fieldId, optionIndex),
        [fieldMutationHandlers]
    );

    const onChangeFieldValue = useCallback(
        (fieldId: number, optionIndex: number, value: string) =>
            fieldMutationHandlers.updateOptionValue(fieldId, optionIndex, value),
        [fieldMutationHandlers]
    );

    const onAddFieldOption = useCallback(
        (fieldId: number) => fieldMutationHandlers.addOption(fieldId),
        [fieldMutationHandlers]
    );

    const deleteOption = useCallback(
        (fieldId: number, optionIndex: number) => fieldMutationHandlers.removeOption(fieldId, optionIndex),
        [fieldMutationHandlers]
    );

    return {
        onChangeFieldOption,
        onChangeFieldValue,
        onAddFieldOption,
        deleteOption,
    };
};
