import { ContentState, EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";

type THtmlToDraftResult = {
  contentBlocks: any;
  entityMap: any;
};

let htmlToDraft: ((html: string) => THtmlToDraftResult) | null = null;
if (typeof window === "object") {
  htmlToDraft = require("html-to-draftjs").default;
}

const EMPTY_DRAFT_HTML_RE =
  /^(<p>(<br\s*\/?>|&nbsp;|\s)*<\/p>\s*)+$/i;

export const looksLikeHtml = (value: string) =>
  /<\/?[a-z][\s\S]*>/i.test(value);

/** Normalize stored answer: empty draft docs → "". */
export const normalizeAnswerValue = (value?: string | null): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (EMPTY_DRAFT_HTML_RE.test(trimmed)) return "";
  return value;
};

export const htmlFromEditorState = (editorState: EditorState): string => {
  const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
  return normalizeAnswerValue(html);
};

export const editorStateFromAnswer = (
  value?: string | null
): EditorState => {
  const normalized = normalizeAnswerValue(value);
  if (!normalized) {
    return EditorState.createEmpty();
  }

  if (looksLikeHtml(normalized) && htmlToDraft) {
    const { contentBlocks, entityMap } = htmlToDraft(normalized);
    return EditorState.createWithContent(
      ContentState.createFromBlockArray(contentBlocks, entityMap)
    );
  }

  return EditorState.createWithContent(
    ContentState.createFromText(normalized)
  );
};
