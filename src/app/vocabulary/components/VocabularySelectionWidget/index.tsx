"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { VocabularyIcon } from "@/components/icons/VocabularyIcon";

type TProps = {
  wrapperId: string;
  onAddSelection: (selection: string) => void;
};

const getSelectionEndRect = (selection: Selection): DOMRect | null => {
  const { focusNode, focusOffset } = selection;
  if (!focusNode) {
    return null;
  }

  const range = document.createRange();

  try {
    range.setStart(focusNode, focusOffset);
    range.collapse(true);
  } catch {
    return null;
  }

  const rects = range.getClientRects();
  if (rects.length > 0) {
    return rects[rects.length - 1];
  }

  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  return rect;
};

export const VocabularySelectionWidget: FC<TProps> = ({
  wrapperId,
  onAddSelection,
}) => {
  const [widgetState, setWidgetState] = useState({
    selection: "",
    left: 0,
    top: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const widgetRef = useRef<HTMLButtonElement>(null);

  const isInsideWrapper = useCallback(
    (node: Node | null | undefined) => {
      let current = node as HTMLElement | null;

      while (current) {
        if (current.id === wrapperId) {
          return true;
        }
        current = current.parentElement;
      }

      return false;
    },
    [wrapperId]
  );

  const updateWidgetFromSelection = useCallback(() => {
    const selection = window.getSelection();
    const wrapper = document.getElementById(wrapperId);
    const bounds = wrapper?.getBoundingClientRect();

    if (
      !selection?.toString()?.trim() ||
      !bounds ||
      !isInsideWrapper(selection.anchorNode)
    ) {
      setIsVisible(false);
      return;
    }

    const endRect = getSelectionEndRect(selection);
    if (!endRect) {
      setIsVisible(false);
      return;
    }

    setWidgetState({
      selection: selection.toString().trim(),
      left: endRect.right - bounds.left,
      top: endRect.bottom - bounds.top,
    });
    setIsVisible(true);
  }, [isInsideWrapper, wrapperId]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;

      if (widgetRef.current?.contains(target)) {
        return;
      }

      const wrapper = document.getElementById(wrapperId);

      if (wrapper?.contains(target)) {
        setIsVisible(false);
      }
    };

    const handlePointerUp = () => {
      window.requestAnimationFrame(() => {
        updateWidgetFromSelection();
      });
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (!selection?.toString()?.trim()) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("touchend", handlePointerUp);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchend", handlePointerUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [updateWidgetFromSelection, wrapperId]);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      ref={widgetRef}
      type="button"
      className="absolute z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-white shadow-lg transition-colors hover:bg-[#faf9ff]"
      style={{
        left: widgetState.left,
        top: widgetState.top,
      }}
      aria-label="Добавить в словарь"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onAddSelection(widgetState.selection);
        setIsVisible(false);
        window.getSelection()?.removeAllRanges();
      }}
    >
      <VocabularyIcon size={20} className="text-primary" />
    </button>
  );
};
