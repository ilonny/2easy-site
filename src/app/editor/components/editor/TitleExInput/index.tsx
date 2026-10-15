"use client";

import { Input, Textarea } from "@nextui-org/react";
import {
  FC,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TitleColorPicker } from "../TitleColorPicker";

type TProps = {
  value: string;
  setValue: (val: string) => void;
  label: ReactNode;
  isTextarea?: boolean;
  onColorChange?: (color: string) => void;
  selectedColor?: string;
};

/**
 * On mobile, a scroll gesture that starts on an input focuses it and opens the
 * keyboard instead of scrolling the editor modal. Keep fields read-only until
 * an intentional tap, then unlock + focus.
 *
 * Title color lives in a sibling `TitleColorPicker` — never overlay a native
 * color input on the text field (that freezes modal scroll on touch devices).
 */
export const TitleExInput: FC<TProps> = ({
  value,
  setValue,
  label,
  isTextarea = false,
  onColorChange,
  selectedColor,
}) => {
  const [editable, setEditable] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tapRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const unlockAndFocus = useCallback(() => {
    setEditable(true);
    requestAnimationFrame(() => {
      const root = wrapRef.current;
      const el = root?.querySelector(
        isTextarea ? "textarea" : "input",
      ) as HTMLElement | null;
      el?.focus?.({ preventScroll: true });
    });
  }, [isTextarea]);

  const onPointerDownCapture = (e: React.PointerEvent) => {
    tapRef.current = {
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
  };

  const onPointerMoveCapture = (e: React.PointerEvent) => {
    const st = tapRef.current;
    if (!st) return;
    if (Math.abs(e.clientX - st.x) > 8 || Math.abs(e.clientY - st.y) > 8) {
      st.moved = true;
    }
  };

  const onPointerUpCapture = () => {
    const st = tapRef.current;
    tapRef.current = null;
    if (!st || st.moved) return;
    if (!editable) unlockAndFocus();
  };

  const field = isTextarea ? (
    <Textarea
      isReadOnly={!editable}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setEditable(false)}
      classNames={{ inputWrapper: "bg-white", input: "min-h-[118px]" }}
      size="lg"
    />
  ) : (
    <Input
      isReadOnly={!editable}
      size="lg"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setEditable(false)}
      classNames={{ inputWrapper: "bg-white" }}
    />
  );

  return (
    <>
      <div className="mb-2 font-light">{label}</div>
      {onColorChange ? (
        <div className="flex items-start gap-2">
          <div
            ref={wrapRef}
            className="min-w-0 flex-1"
            onPointerDownCapture={onPointerDownCapture}
            onPointerMoveCapture={onPointerMoveCapture}
            onPointerUpCapture={onPointerUpCapture}
          >
            {field}
          </div>
          <TitleColorPicker
            value={selectedColor}
            onChange={onColorChange}
          />
        </div>
      ) : (
        <div
          ref={wrapRef}
          onPointerDownCapture={onPointerDownCapture}
          onPointerMoveCapture={onPointerMoveCapture}
          onPointerUpCapture={onPointerUpCapture}
        >
          {field}
        </div>
      )}
    </>
  );
};
