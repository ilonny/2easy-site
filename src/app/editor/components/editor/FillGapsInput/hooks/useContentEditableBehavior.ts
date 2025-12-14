import { useEffect, RefObject } from "react";

export const useContentEditableBehavior = (
  contentEditableRef: RefObject<HTMLDivElement>,
  onChangeText: (text: string) => void
) => {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.removedNodes.forEach((removedNode) => {
            if (removedNode instanceof Element && removedNode.classList.contains('answerWrapper')) {
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

  useEffect(() => {
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
