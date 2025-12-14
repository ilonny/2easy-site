import { Button, Card,  } from "@nextui-org/react";
import {FC, MouseEvent, useCallback, useEffect,  useState} from "react";

type TProps = {
  onClickAddSelection: (
    state: {
      selection: string;
      left: number;
      top: number;
      baseOffset: number;
      focusOffset: number;
    }
  ) => void;
};

export const AddItemCard: FC<TProps> = ({ onClickAddSelection }) => {
  const [addItemState, setAddItemState] = useState<{
    selection: string;
    left: number;
    top: number;
    baseOffset: number;
    focusOffset: number;
  }>({ selection: "", left: 0, top: 0, baseOffset: 0, focusOffset: 0 });

  const [addItemIsVisible, setAddItemIsVisible] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const parent = window?.getSelection()?.anchorNode?.parentNode;
      const parentParent = parent?.parentNode;
      const parentParentParent = parentParent?.parentNode;
      const parentParentParentParent = parentParentParent?.parentNode;
      if (
        parent?.id !== "contentEditableWrapper" &&
        parentParent?.id !== "contentEditableWrapper" &&
        parentParentParent?.id !== "contentEditableWrapper" &&
        parentParentParentParent?.id !== "contentEditableWrapper"
      ) {
        setAddItemIsVisible(false);
        return;
      }
      // Действия, которые нужно выполнить при изменении выделения
      const selection = window?.getSelection();
      const bounds = document
        ?.getElementById("contentEditableWrapper")
        ?.getBoundingClientRect();
      if (!selection?.toString() || !bounds) {
        setAddItemIsVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const bound = range.getBoundingClientRect();
      setAddItemState({
        selection: selection.toString(),
        left: bound.left - bounds.left,
        top: bound.top - bounds.top + 20,
        baseOffset: selection.anchorOffset,
        focusOffset: selection.focusOffset,
      });
      setAddItemIsVisible(true);
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleOnAdd=useCallback(
      (e: MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation();
      onClickAddSelection(addItemState);
      setTimeout(() => {
        setAddItemIsVisible(false);
      }, 100);
  },[addItemState, onClickAddSelection])

  return (
    <Card
      radius="md"
      shadow="lg"
      style={{
        position: "absolute",
        left: addItemState.left,
        top: addItemState.top,
        opacity: addItemIsVisible ? 1 : 0,
        pointerEvents: addItemIsVisible ? "auto" : "none",
        zIndex: 10,
      }}
    >
      <Button
        style={{
          padding: 10,
          background: "#fff",
          cursor: "pointer",
        }}
        onClick={handleOnAdd}
      >
        <p style={{ color: "#3F28C6" }}>+ пропустить</p>
      </Button>
    </Card>
  );
};
