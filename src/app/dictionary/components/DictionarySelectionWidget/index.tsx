"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { DictionaryIcon } from "@/components/icons/DictionaryIcon";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  DICTIONARY_SELECTION_WIDGET_ESTIMATED_HEIGHT,
  DICTIONARY_SELECTION_WIDGET_ESTIMATED_WIDTH,
  DICTIONARY_SELECTION_WIDGET_OFFSET,
  DICTIONARY_SELECTION_WIDGET_PILL_CLASS,
  DICTIONARY_SELECTION_WIDGET_PILL_HIDDEN_CLASS,
  DICTIONARY_SELECTION_WIDGET_PILL_VISIBLE_CLASS,
  DICTIONARY_SELECTION_WIDGET_SHOW_DELAY_MS,
} from "../../constants";
import { getSelectionEndRect } from "../../utils/selection";
import { clampWidgetPosition } from "../../utils/clampWidgetPosition";

type TProps = {
  wrapperId: string;
  onAddSelection: (selection: string) => void;
};

export const DictionarySelectionWidget: FC<TProps> = ({
  wrapperId,
  onAddSelection,
}) => {
  const [widgetState, setWidgetState] = useState({
    selection: "",
    left: 0,
    top: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);
  const widgetRef = useRef<HTMLButtonElement>(null);
  const showTimeoutRef = useRef<number | null>(null);

  const clearShowTimeout = useCallback(() => {
    if (showTimeoutRef.current !== null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setIsAnimatedIn(false);
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsAnimatedIn(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isVisible, widgetState.selection]);

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

    const position = clampWidgetPosition(
      endRect.right - bounds.left + DICTIONARY_SELECTION_WIDGET_OFFSET,
      endRect.bottom - bounds.top + DICTIONARY_SELECTION_WIDGET_OFFSET,
      DICTIONARY_SELECTION_WIDGET_ESTIMATED_WIDTH,
      DICTIONARY_SELECTION_WIDGET_ESTIMATED_HEIGHT,
      bounds.width,
      bounds.height
    );

    setWidgetState({
      selection: selection.toString().trim(),
      left: position.left,
      top: position.top,
    });
    setIsVisible(true);
  }, [isInsideWrapper, wrapperId]);

  const scheduleShowFromSelection = useCallback(() => {
    clearShowTimeout();
    showTimeoutRef.current = window.setTimeout(() => {
      updateWidgetFromSelection();
    }, DICTIONARY_SELECTION_WIDGET_SHOW_DELAY_MS);
  }, [clearShowTimeout, updateWidgetFromSelection]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;

      if (widgetRef.current?.contains(target)) {
        return;
      }

      const wrapper = document.getElementById(wrapperId);

      if (!wrapper?.contains(target)) {
        clearShowTimeout();
        setIsVisible(false);
      }
    };

    const handlePointerUp = () => {
      scheduleShowFromSelection();
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (!selection?.toString()?.trim()) {
        clearShowTimeout();
        setIsVisible(false);
        return;
      }

      if (isVisible) {
        updateWidgetFromSelection();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("touchend", handlePointerUp);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      clearShowTimeout();
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchend", handlePointerUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [
    clearShowTimeout,
    isVisible,
    scheduleShowFromSelection,
    updateWidgetFromSelection,
    wrapperId,
  ]);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      ref={widgetRef}
      type="button"
      className={`${DICTIONARY_SELECTION_WIDGET_PILL_CLASS} ${
        isAnimatedIn
          ? DICTIONARY_SELECTION_WIDGET_PILL_VISIBLE_CLASS
          : DICTIONARY_SELECTION_WIDGET_PILL_HIDDEN_CLASS
      }`}
      style={{
        left: widgetState.left,
        top: widgetState.top,
      }}
      aria-label={i18n.t("dictionary.addToDictionary")}
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
        clearShowTimeout();
        setIsVisible(false);
        window.getSelection()?.removeAllRanges();
      }}
    >
      <DictionaryIcon size={20} className="shrink-0 text-primary" />
      <T k="dictionary.addToDictionary" defaultText="Добавить в словарь" />
    </button>
  );
};
