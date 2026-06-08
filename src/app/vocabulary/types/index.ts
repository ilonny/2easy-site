export type TVocabularyItem = {
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

export type TVocabularyListParams = {
  search?: string;
  isLearned?: boolean;
  lessonId?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
};
