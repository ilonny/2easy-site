import { Button, Card, Select } from "@nextui-org/react";
import { FC, useEffect, useRef, useState } from "react";

type TProps = {
  onClickAddSelection: () => void;
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
  // const [pointerEvents, setPointerEvents] = useState<"auto" | "none">("auto");
  const selectionRef = useRef(null);
  const rangeRef = useRef(null);

  // useEffect(() => {
  //   if (!addItemIsVisible) {
  //     setTimeout(() => {
  //       setPointerEvents("none");
  //     }, 300);
  //   }
  //   if (addItemIsVisible) {
  //     setTimeout(() => {
  //       setPointerEvents("auto");
  //     }, 300);
  //   }
  // }, [addItemIsVisible]);

  useEffect(() => {
    const handleSelectionChange = (e) => {
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
      // range.deleteContents();
      const bound = range.getBoundingClientRect();
      setAddItemState({
        selection: selection.toString(),
        left: bound.left - bounds.left,
        top: bound.top - bounds.top + 20,
        baseOffset: selection.anchorOffset,
        focusOffset: selection.focusOffset,
        // range: range.cloneContents(),
      });
      setAddItemIsVisible(true);
    };

    // Подписываемся на событие selectionchange
    document.addEventListener("selectionchange", handleSelectionChange);

    // Функция для отписки от события при размонтировании компонента
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      console.log("Selectionchange listener removed"); //Optional, but good for debugging
    };
  }, []); // Пустой массив зависимостей означает, что эффект запускается только один раз (при монтировании компонента)

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
        // zIndex: addItemIsVisible ? 1 : -1,
        // maxWidth: addItemIsVisible ? "initial" : 10,
        // maxHeight: addItemIsVisible ? "initial" : 10,
        // pointerEvents: addItemIsVisible ? "auto" : "none",
      }}
    >
      <Button
        style={{
          padding: 10,
          background: "#fff",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClickAddSelection(addItemState);
          setTimeout(() => {
            setAddItemIsVisible(false);
          }, 100);
        }}
      >
        <p style={{ color: "#3F28C6" }}>+ пропустить</p>
      </Button>
    </Card>
  );
};
