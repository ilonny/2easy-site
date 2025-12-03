"use client";
import {useExData} from "../hooks/useExData";
import {TFillGapsSelectData} from "./types";
import {FC, useCallback, useState} from "react";
import styles from "./styles.module.css";
import {defaultValuesStub} from "./constants/defaults";
import {Form} from "./components/Form";
import {EditorArea} from "./components/EditorArea";
import {Preview} from "./components/Preview";
import {useUploadFillGapsSelectEx} from "../hooks/useUploadFillGapsSelectEx";
import {
    useFieldMutations,
    usePopoverRender,
    useContentEditable,
    useAddSelection,
    useDataInitialization,
} from "./hooks";

/**
 * Параметры компонента FillGapsSelect
 *
 * @typedef {Object} TProps
 * @property {() => void} onSuccess - Callback, вызывается при успешном сохранении упражнения
 * @property {Partial<TFillGapsSelectData>} [defaultValues] - Начальные значения для редактирования существующего упражнения
 * @property {number} lastSortIndex - Индекс сортировки для нового упражнения
 * @property {boolean} [currentSortIndexToShift] - Флаг для сдвига индексов других упражнений
 */
type TProps = {
    onSuccess: () => void;
    defaultValues?: Partial<TFillGapsSelectData>;
    lastSortIndex: number;
    currentSortIndexToShift?: boolean;
};

export const FillGapsSelect: FC<TProps> = ({
    onSuccess,
    defaultValues,
    lastSortIndex,
    currentSortIndexToShift,
}) => {
    /**
     * FillGapsSelect - основной компонент для создания и редактирования упражнений "заполни пропуски"
     *
     * Функциональность:
     * - Управление текстом с пропусками через contentEditable редактор
     * - Выделение слов и превращение их в пропуски с вариантами ответов
     * - Редактирование вариантов ответов для каждого пропуска (добавление, удаление, изменение)
     * - Загрузка и редактирование изображений для упражнения
     * - Сохранение упражнения на сервер
     *
     * Структура компонента:
     * 1. Инициализация данных (загрузка сохраненного упражнения или создание нового)
     * 2. Форма для ввода метаданных (название, описание, изображения)
     * 3. Редактор текста с поддержкой создания пропусков
     * 4. Превью и кнопка сохранения
     */
    const {isLoading, saveFillGapsSelectEx, success} =
        useUploadFillGapsSelectEx(lastSortIndex, currentSortIndexToShift);
    const {data, changeData, resetData} = useExData<TFillGapsSelectData>(
        defaultValues ? (defaultValues as TFillGapsSelectData) : defaultValuesStub
    );
    const [images, setImages] = useState<TFillGapsSelectData["images"]>(
        defaultValues?.images || []
    );

    // Инициализация данных при загрузке компонента и обработка успешного сохранения
    useDataInitialization(data, images, success, resetData, changeData, onSuccess);

    // Получаем callback'и для редактирования вариантов ответов (добавление, удаление, редактирование)
    const {onChangeFieldOption, onChangeFieldValue, onAddFieldOption, deleteOption} =
        useFieldMutations(data, changeData);

    // Callback для добавления новых пропусков из выделенного текста
    const onClickAddSelection = useAddSelection(data, changeData);

    // Callback для обновления текста упражнения при редактировании
    const onChangeText = useCallback(
        (text: string) => {
            changeData("dataText", text);
        },
        [changeData]
    );

    // Рендеринг React roots для поповеров каждого пропуска
    const rootsRef = usePopoverRender(data, {
        onChangeFieldOption,
        onChangeFieldValue,
        onAddFieldOption,
        deleteOption,
    });

    // Управление contentEditable элементом (отслеживание удаления пропусков, обработка paste)
    const contentEditableRef = useContentEditable(onChangeText, rootsRef);

    return (
        <div>
            <Form data={data} changeData={changeData} images={images} setImages={setImages} />
            <div className="h-10" />
            <EditorArea
                onClickAddSelection={onClickAddSelection}
                onChangeText={onChangeText}
                contentEditableRef={contentEditableRef}
                styles={styles}
            />
            <div className="h-10" />
            <Preview data={data} isLoading={isLoading} saveFillGapsSelectEx={saveFillGapsSelectEx} />
            <div className="h-10" />
        </div>
    );
};

