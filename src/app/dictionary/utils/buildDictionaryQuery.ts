import { TDictionaryListParams } from "../types";

export const buildDictionaryQueryString = (
  params: TDictionaryListParams = {}
) => {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }
  if (typeof params.isLearned === "boolean") {
    query.set("isLearned", String(params.isLearned));
  }
  if (params.lessonId) {
    query.set("lessonId", String(params.lessonId));
  }
  if (params.sortField) {
    query.set("sortField", params.sortField);
  }
  if (params.sortOrder) {
    query.set("sortOrder", params.sortOrder);
  }

  return query.toString();
};
