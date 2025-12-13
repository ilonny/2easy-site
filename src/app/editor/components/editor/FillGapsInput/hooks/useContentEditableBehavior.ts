import { useEffect, RefObject } from "react";
import { ANSWER_WRAPPER_CLASS } from "../constants";

/**
 * Хук для управления contentEditable div'ом:
 * - MutationObserver для отслеживания удаления пропусков
 * - Paste listener для вставки только текста
 */
export const useContentEditableBehavior = (
  contentEditableRef: RefObject<HTMLDivElement>,
  onChangeText: (text: string) => void
) => {
  // MutationObserver для отслеживания удаления элементов пропусков
  useEffect(() => {
    console.log('MutationObserver')
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.removedNodes.forEach((removedNode) => {
            if (removedNode instanceof Element && removedNode.classList.contains(ANSWER_WRAPPER_CLASS)) {
              const answerAttr = removedNode.getAttribute("answer") || "";
              const text = answerAttr.replace("[", "").replace("]", "");
              if (mutation.previousSibling && mutation.previousSibling.nodeType === Node.TEXT_NODE) {
                const txt = mutation.previousSibling as Text;
                txt.data = (txt.data || "") + " " + text + " ";
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

    return () => {
      observer.disconnect();
    };
  }, [onChangeText, contentEditableRef]);

  // Paste listener для вставки только текста
  useEffect(() => {
    console.log('pasteListener',)
    const pasteListener = (e: Event) => {
      const evt = e as ClipboardEvent;
      evt.preventDefault?.();
      const text = evt.clipboardData?.getData("text/plain") || "";
      document.execCommand("insertHTML", false, text);
    };

    const wrapper = contentEditableRef.current;
    if (wrapper) {
      wrapper.addEventListener("paste", pasteListener);
      return () => {
        wrapper.removeEventListener("paste", pasteListener);
      };
    }
  }, [contentEditableRef]);
};
