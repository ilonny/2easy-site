import { TFillGapsSelectData } from "../types";

/**
 * Значения по умолчанию для нового упражнения "заполни пропуски"
 *
 * Используется в двух случаях:
 * 1. При создании нового упражнения (когда data.id не установлен)
 * 2. После успешного сохранения (для очистки формы и создания следующего упражнения)
 *
 * Содержит:
 * - Предустановленные заголовок и описание на английском
 * - Фиолетовый цвет для заголовка (#3F28C6)
 * - Пустые массивы для изображений, полей и текста
 *
 * @type {TFillGapsSelectData}
 *
 * @example
 * // При инициализации нового упражнения
 * const data = { ...defaultValuesStub };
 *
 * // После очистки формы
 * resetData(defaultValuesStub);
 */
export const defaultValuesStub: TFillGapsSelectData = {
  // Основной текст (заголовок)
  title: "Let's practice!",
  
  // Цвет заголовка в формате hex
  titleColor: "#3F28C6",
  
  // Подзаголовок - инструкция для учащихся
  subtitle: "Choose the correct option to complete the sentences",
  
  // Полное описание упражнения
  description: "Answer the questions below",
  
  // Изображения (пусто при создании нового)
  images: [],
  
  // Основной текст с пропусками в формате HTML (пусто при создании нового)
  dataText: "",
  
  // Массив пропусков (пусто при создании нового)
  fields: [],
};
