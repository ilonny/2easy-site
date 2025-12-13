import {useCallback, useEffect} from "react";
import {TFillGapsSelectData} from "../types";
import {defaultValuesStub} from "../constants/defaults";

/**
 * Hook для инициализации и синхронизации данных упражнения
 *
 * Отвечает за три ключевых процесса:
 *
 * 1. Инициализация данных
 *    - Если data.id не установлен, инициализирует данные с defaultValuesStub
 *    - Это происходит при создании нового упражнения
 *
 * 2. Синхронизация изображений
 *    - Следит за изменениями массива images (из локального state)
 *    - Обновляет data.images при каждом изменении
 *    - Нужно для сохранения загруженных изображений
 *
 * 3. Обработка успешного сохранения
 *    - Слушает флаг success от useUploadFillGapsSelectEx
 *    - Вызывает callback onSuccess
 *    - Сбрасывает данные на defaultValuesStub (очищает форму)
 *
 * @param {TFillGapsSelectData} data - Текущие данные упражнения
 * @param {TFillGapsSelectData["images"]} images - Массив загруженных изображений
 * @param {boolean} success - Флаг успешного сохранения
 * @param {Function} resetData - Функция для полной замены данных
 * @param {Function} changeData - Функция для обновления конкретного поля
 * @param {() => void} [onSuccess] - Callback при успешном сохранении
 *
 * @example
 * useDataInitialization(data, images, success, resetData, changeData, () => {
 *   // console.log('Упражнение сохранено!');
 * });
 */
export const useDataInitialization = (
    data: TFillGapsSelectData,
    images: TFillGapsSelectData["images"],
    success: boolean,
    resetData: (data: TFillGapsSelectData) => void,
    changeData: <K extends keyof TFillGapsSelectData>(key: K, value: TFillGapsSelectData[K]) => void,
    onSuccess?: () => void
) => {
    /**
     * Effect: Инициализация данных при первой загрузке
     *
     * Если data.id не установлен, значит это новое упражнение.
     * Заполняем его значениями по умолчанию.
     */
    useEffect(() => {
        if (!data?.id) {
            resetData(defaultValuesStub);
        }
    }, [data?.id, resetData]);

    /**
     * Effect: Синхронизация изображений
     *
     * Каждый раз, когда пользователь загружает изображение,
     * оно попадает в локальный state (images), и нужно обновить
     * это изменение в основных данных (data.images).
     */
    useEffect(() => {
        changeData("images", images);
    }, [images, changeData]);

    /**
     * Effect: Обработка успешного сохранения
     *
     * После успешной отправки на сервер:
     * 1. Вызываем callback onSuccess (для закрытия модального окна и т.д.)
     * 2. Сбрасываем данные для создания нового упражнения
     */
    useEffect(() => {
        if (success) {
            onSuccess?.();
            resetData(defaultValuesStub);
        }
    }, [onSuccess, success, resetData]);
};
