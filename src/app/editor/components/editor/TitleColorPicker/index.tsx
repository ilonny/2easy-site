"use client";

import { FC, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { T } from "@/i18n/T";

/** Same palette as the rich-text color picker in exercise editors. */
export const TITLE_COLOR_PRESETS = [
  "#3F28C6",
  "#191919",
  "#EEEBFF",
  "#CCBCFF",
  "#FFE5F7",
  "#FF7ECC",
  "#FFD2C8",
  "#8EE8FF",
  "#E4FF38",
  "#FFFFBA",
  "#F2F226",
  "#61BD6D",
  "#1ABC9C",
  "#54ACD2",
  "#2C82C9",
  "#9365B8",
  "#475577",
  "#CCCCCC",
  "#FFFFFF",
  "#F44336",
  "#FF9800",
  "#4CAF50",
  "#2196F3",
  "#000000",
] as const;

type TProps = {
  value?: string;
  onChange: (color: string) => void;
  "aria-label"?: string;
};

const normalizeHex = (color: string | undefined) => {
  if (!color) return "#3F28C6";
  const t = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(t)) return t.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(t)) {
    const r = t[1];
    const g = t[2];
    const b = t[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return t;
};

/**
 * Standalone title-color control (not nested inside the text field).
 * Uses a swatch popover instead of native `input[type=color]`, which breaks
 * touch scrolling inside the editor modal on mobile.
 */
export const TitleColorPicker: FC<TProps> = ({
  value,
  onChange,
  "aria-label": ariaLabel,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = useMemo(() => normalizeHex(value), [value]);
  const label =
    ariaLabel ||
    t("editor.titleColor", { defaultValue: "Цвет заголовка" });

  return (
    <Popover
      isOpen={open}
      onOpenChange={setOpen}
      placement="bottom-end"
      offset={8}
      shouldBlockScroll={false}
    >
      <PopoverTrigger>
        <button
          type="button"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-default-200 bg-white shadow-sm touch-manipulation"
          aria-label={label}
          title={current}
        >
          <span
            className="block h-7 w-7 rounded-md ring-1 ring-black/10"
            style={{ backgroundColor: current }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-3">
        <p className="mb-2 text-xs font-medium text-default-500">
          <T k="editor.titleColor" defaultText="Цвет заголовка" />
        </p>
        <div className="grid grid-cols-6 gap-1.5">
          {TITLE_COLOR_PRESETS.map((color) => {
            const selected = normalizeHex(color) === current;
            return (
              <button
                key={color}
                type="button"
                className={`h-7 w-7 rounded-md ring-1 ring-black/10 touch-manipulation ${
                  selected
                    ? "outline outline-2 outline-offset-1 outline-primary"
                    : ""
                }`}
                style={{ backgroundColor: color }}
                aria-label={color}
                aria-pressed={selected}
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
              />
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
