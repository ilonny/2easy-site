"use client";

import {
  TCellRun,
  cssColorToHex,
  sanitizeRuns,
} from "./tablesModel";

type TMarks = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
};

function isBold(el: HTMLElement, tag: string): boolean {
  if (tag === "B" || tag === "STRONG") return true;
  const weight = el.style?.fontWeight || "";
  if (weight === "bold" || weight === "bolder") return true;
  const n = Number(weight);
  return Number.isFinite(n) && n >= 600;
}

function isItalic(el: HTMLElement, tag: string): boolean {
  if (tag === "I" || tag === "EM") return true;
  const style = el.style?.fontStyle || "";
  return style === "italic" || style === "oblique";
}

function isUnderline(el: HTMLElement, tag: string): boolean {
  if (tag === "U") return true;
  const decoration = `${el.style?.textDecoration || ""} ${
    el.style?.textDecorationLine || ""
  }`;
  return decoration.includes("underline");
}

function readColor(el: HTMLElement): string | undefined {
  const fromStyle = cssColorToHex(el.style?.color || "");
  if (fromStyle) return fromStyle;
  return cssColorToHex(el.getAttribute("color") || "");
}

function pushRun(runs: TCellRun[], run: TCellRun) {
  if (!run.text) return;
  const prev = runs[runs.length - 1];
  if (
    prev &&
    !!prev.bold === !!run.bold &&
    !!prev.italic === !!run.italic &&
    !!prev.underline === !!run.underline &&
    (prev.color || "") === (run.color || "")
  ) {
    prev.text += run.text;
    return;
  }
  runs.push(run);
}

/**
 * Read a contentEditable cell into runs.
 * Handles Chrome/Safari output: b/i/u, span styles, font color, div/br line breaks.
 */
export function domToRuns(root: HTMLElement | null): TCellRun[] {
  if (!root) return [{ text: "" }];
  const runs: TCellRun[] = [];

  const walk = (node: Node, marks: TMarks) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || "").replace(/\u200b/g, "");
      pushRun(runs, { ...marks, text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (tag === "BR") {
      pushRun(runs, { ...marks, text: "\n" });
      return;
    }
    const next: TMarks = { ...marks };
    if (isBold(el, tag)) next.bold = true;
    if (isItalic(el, tag)) next.italic = true;
    if (isUnderline(el, tag)) next.underline = true;
    const color = readColor(el);
    if (color) next.color = color;

    const kids = Array.from(el.childNodes);
    if (
      (tag === "DIV" || tag === "P") &&
      kids.length === 1 &&
      kids[0].nodeType === Node.ELEMENT_NODE &&
      (kids[0] as HTMLElement).tagName === "BR"
    ) {
      pushRun(runs, { ...next, text: "\n" });
      return;
    }
    kids.forEach((child) => walk(child, next));
  };

  Array.from(root.childNodes).forEach((node, index) => {
    const tag =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement).tagName
        : "";
    if (index > 0 && (tag === "DIV" || tag === "P")) {
      pushRun(runs, { text: "\n" });
    }
    walk(node, {});
  });

  return sanitizeRuns(runs);
}
