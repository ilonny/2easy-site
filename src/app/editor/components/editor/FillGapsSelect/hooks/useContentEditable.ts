import {useEffect, useRef} from "react";
import {Root} from "react-dom/client";

export const useContentEditable = (
    onChangeText: (text: string) => void,
    rootsRef: React.MutableRefObject<Map<number, Root>>
) => {
    const contentEditableRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.removedNodes.forEach((removedNode) => {
                        const removedEl = removedNode as HTMLElement;
                        if (removedEl.classList?.contains("answerWrapper")) {
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
