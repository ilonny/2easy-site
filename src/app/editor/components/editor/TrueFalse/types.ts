"use client";

export type TTrueFalseAnswer = boolean;

export type TTrueFalseSentence = {
  id: string;
  text: string;
  /** Correct answer for the student */
  answer: TTrueFalseAnswer;
};

export type TTrueFalseData = {
  id?: number;
  sortIndex?: number;

  title?: string;
  titleColor?: string;
  subtitle?: string;
  description?: string;
  images?: Array<Record<string, string>>;

  sentences: TTrueFalseSentence[];
};

export function isTrueFalseSentenceValid(s: {
  text?: string;
  answer?: unknown;
}): boolean {
  if (!String(s?.text || "").trim()) return false;
  return typeof s?.answer === "boolean";
}
