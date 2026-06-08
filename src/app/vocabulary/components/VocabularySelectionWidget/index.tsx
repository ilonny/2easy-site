"use client";

import { Button, Card } from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { T } from "@/i18n/T";

type TProps = {
  wrapperId: string;
  onAddSelection: (selection: string) => void;
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

    const range = selection.getRangeAt(0);
    const bound = range.getBoundingClientRect();

    setWidgetState({
      selection: selection.toString().trim(),
      left: bound.left - bounds.left,
      top: bound.top - bounds.top + 20,
    });
    setIsVisible(true);
  }, [isInsideWrapper, wrapperId]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
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
    <Card
      radius="md"
      shadow="lg"
      className="absolute z-20 p-0 overflow-hidden border border-primary/20"
      style={{
        left: widgetState.left,
        top: widgetState.top,
      }}
    >
      <Button
        color="primary"
        variant="flat"
        size="sm"
        className="px-3 py-2 h-auto min-h-0"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          onAddSelection(widgetState.selection);
          setIsVisible(false);
          window.getSelection()?.removeAllRanges();
        }}
      >
        <T k="vocabulary.addToDictionary" defaultText="Добавить в словарь" />
      </Button>
    </Card>
  );
};
