import { TField } from "../types";

/**
 * Находит поле пропуска по его ID в массиве полей
 * @param fields - Массив полей для поиска
 * @param fieldId - ID поля для поиска
 * @returns Найденное поле или undefined
 */
export const findFieldById = (fields: TField[], fieldId: string) =>
  fields.find((f) => f.id === fieldId);
