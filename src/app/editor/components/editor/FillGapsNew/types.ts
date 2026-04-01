"use client";

export type TFillGapsNewMode = "input" | "select" | "drag";

export type TSlateText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
};

export type TSlateGapElement = {
  type: "gap";
  gapId: string;
  children: TSlateText[];
};

export type TSlateParagraphElement = {
  type: "paragraph";
  children: Array<TSlateText | TSlateGapElement>;
};

export type TFillGapsNewContent = Array<TSlateParagraphElement>;

export type TFillGapsNewOption = {
  id: string;
  value: string;
  isCorrect: boolean;
};

export type TFillGapsNewGap = {
  id: string;
  options: TFillGapsNewOption[];
  originalText?: string;
};

export type TFillGapsNewData = {
  id?: number;
  sortIndex?: number;

  title?: string;
  titleColor?: string;
  subtitle?: string;
  description?: string;
  images?: Array<Record<string, string>>;

  mode: TFillGapsNewMode;
  content: TFillGapsNewContent;
  gaps: TFillGapsNewGap[];
};

