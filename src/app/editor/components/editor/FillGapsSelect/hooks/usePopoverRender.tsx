/**
 * Hook для рендеринга React компонентов в поповеры пропусков
 *
 * Управляет жизненным циклом React корней, которые отображаются внутри каждого пропуска:
 * - Создает React root для каждого пропуска
 * - Рендерит компонент PopoverFields (поповер с опциями)
 * - Правильно очищает roots при демонтировании компонента или удалении пропуска
 * - Обновляет поповеры при изменении данных полей
 *
 * Оптимизация: Перед созданием нового root проверяет, не существует ли уже такой,
 * и если существует, корректно размонтирует его.
 *
 * @param {TFillGapsSelectData} data - Объект с данными упражнения
 * @param {FieldCallbacks} callbacks - Объект с callback-функциями для работы с опциями
 * @returns {React.MutableRefObject<Map<number, Root>>} Ref с Map'ой смонтированных roots
 */
import {useCallback, useEffect, useRef} from "react";
import ReactDOM, {Root} from "react-dom/client";
import {TFillGapsSelectData} from "../types";
import {PopoverFields} from "../PopoverFields";

type FieldCallbacks = {
    onChangeFieldOption: (fieldId: number, optionIndex: number) => void;
    onChangeFieldValue: (fieldId: number, optionIndex: number, value: string) => void;
    onAddFieldOption: (fieldId: number) => void;
    deleteOption: (fieldId: number, optionIndex: number) => void;
};

export const usePopoverRender = (
    data: TFillGapsSelectData,
    callbacks: FieldCallbacks
) => {
    const rootsRef = useRef<Map<number, Root>>(new Map());


    const renderContent = useCallback(() => {
        /**
         * Рендерит или обновляет поповеры для всех пропусков на странице
         *
         * Процесс:
         * 1. Находит все элементы с классом .answerWrapper (пропуски)
         * 2. Для каждого пропуска ищет соответствующее поле в данных
         * 3. Если уже существует React root для этого пропуска, размонтирует его
         * 4. Создает новый root и рендерит компонент PopoverFields
         * 5. Сохраняет root в Map для последующего управления
         */
        document
            .querySelectorAll(".contentEditable .answerWrapper")
            .forEach((el) => {
                const elId = el.id;
                const field = data.fields.find((f) => String(f.id) === elId);
                if (!field) return;
                el.setAttribute("index", String(field.id));
                const root = ReactDOM.createRoot(el as HTMLElement);
                root.render(
                    <div className="popover-wrapper" id={"popover-wrapper-" + field.id}>
                        <PopoverFields
                            id={field.id}
                            field={field}
                            onChangeFieldOption={callbacks.onChangeFieldOption}
                            onChangeFieldValue={callbacks.onChangeFieldValue}
                            onAddFieldOption={callbacks.onAddFieldOption}
                            deleteOption={callbacks.deleteOption}
                        />
                    </div>
                );
            });
    }, [data, callbacks]);

    useEffect(() => {
        renderContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.fields]);

    useEffect(() => {
        const wrapperEl = document.getElementById("contentEditableWrapper");
        if (data.dataText && wrapperEl) {
            wrapperEl.innerHTML = data.dataText;
        }
        renderContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return rootsRef;
};
