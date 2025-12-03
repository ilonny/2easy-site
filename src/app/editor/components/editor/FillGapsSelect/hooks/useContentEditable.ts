import {useEffect, useRef} from "react";
import {Root} from "react-dom/client";

/**
 * Hook для управления contentEditable элементом и связанными событиями
 *
 * Функциональность:
 * - Отслеживает удаление пропусков (answerWrapper) из текста через MutationObserver
 * - При удалении пропуска восстанавливает исходный текст и очищает соответствующий React root
 * - Обрабатывает вставку простого текста (paste event) без HTML форматирования
 * - Правильно управляет жизненным циклом - отписывается от событий при демонтировании
 *
 * Оптимизация: Использует MutationObserver для асинхронного отслеживания изменений DOM,
 * что не блокирует основной поток.
 *
 * @param {Function} onChangeText - Callback, вызывается при изменении текста
 * @param {React.MutableRefObject<Map<number, Root>>} rootsRef - Ref с смонтированными React roots пропусков
 * @returns {React.MutableRefObject<HTMLElement | null>} Ref на contentEditable элемент
 *
 * @example
 * const contentEditableRef = useContentEditable(onChangeText, rootsRef);
 * // В JSX: <EditorArea contentEditableRef={contentEditableRef} />
 */
export const useContentEditable = (
    onChangeText: (text: string) => void,
    rootsRef: React.MutableRefObject<Map<number, Root>>
) => {
    const contentEditableRef = useRef<HTMLElement | null>(null);

    /**
     * Effect: Отслеживание удаления пропусков
     *
     * Наблюдает за изменениями в contentEditable элементе:
     * - Когда пропуск (answerWrapper) удаляется, восстанавливает его исходный текст
     * - Размонтирует соответствующий React root
     * - Обновляет data.dataText
     * - При размонтировании effect'а очищает все оставшиеся roots
     */
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.removedNodes.forEach((removedNode) => {
                        const removedEl = removedNode as HTMLElement;
                        if (removedEl.classList?.contains("answerWrapper")) {
                            // Очищаем React root для удаленного пропуска
                            const removedId = Number(removedEl.id);
                            const mounted = rootsRef.current.get(removedId);
                            if (mounted) {
                                try {
                                    mounted.unmount();
                                } catch {
                                    // ignore
                                }
                                rootsRef.current.delete(removedId);
                            }

                            // Восстанавливаем исходный текст пропуска
                            const prev = mutation.previousSibling as Node | null;
                            if (prev && prev.nodeValue !== null) {
                                prev.nodeValue =
                                    prev.nodeValue +
                                    " " +
                                    (removedEl.getAttribute("answer") || "")
                                        .replace("[", "")
                                        .replace("]", "") +
                                    " ";
                            }
                            onChangeText(contentEditableRef.current?.innerHTML || "");
                        }
                    });
                }
            });
        });

        const currentRef = contentEditableRef.current;
        if (currentRef) {
            observer.observe(currentRef, {
                childList: true,
                subtree: true,
                characterData: false,
            });
        }

        const mountedRoots = rootsRef.current;
        return () => {
            observer.disconnect();
            // Очищаем все roots при размонтировании
            mountedRoots.forEach((r) => {
                try {
                    r.unmount();
                } catch {
                    // ignore
                }
            });
            mountedRoots.clear();
        };
    }, [onChangeText, rootsRef]);

    /**
     * Effect: Обработка paste события
     *
     * Предотвращает вставку форматированного HTML и сохраняет только простой текст.
     * Это нужно для того, чтобы пользователь не мог случайно нарушить структуру
     * contentEditable с помощью копирования форматированного текста.
     */
    useEffect(() => {
        const pasteListener = (e: ClipboardEvent) => {
            e.preventDefault();
            const text = e.clipboardData?.getData("text/plain") || "";
            document.execCommand("insertHTML", false, text);
        };

        const wrapper = document.getElementById("contentEditableWrapper");
        wrapper?.addEventListener("paste", pasteListener);

        return () => {
            wrapper?.removeEventListener("paste", pasteListener);
        };
    }, []);

    return contentEditableRef;
};
