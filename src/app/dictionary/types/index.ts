export type TDictionaryItem = {
  id: number;
  studentId: number;
  lessonId: number | null;
  sourceWord: string;
  translatedWord: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  isLearned: boolean;
  isFavorite: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TLanguage = {
  code: string;
  name: string;
  nativeName: string;
};

export type TDictionaryListParams = {
  search?: string;
  isLearned?: boolean;
  lessonId?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
};

export type TTranslateResult = {
  sourceWord: string;
  translatedWord: string;
};

export type TCreateWordPayload = {
  sourceWord: string;
  translatedWord: string;
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
  lessonId?: number;
};

export type DictionaryTab = "unlearned" | "learned";

export type TSpeechPlaybackState = {
  activeId: string | null;
  isLoading: boolean;
};

export type TSynthesizeSpeechPayload = {
  text: string;
};
