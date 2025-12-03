/**
 * TOption - один вариант ответа для пропуска
 *
 * @property {string} value - текст варианта ответа
 * @property {boolean} isCorrect - флаг, является ли это правильным ответом
 *
 * Пример: { value: "important", isCorrect: true }
 */
export type TOption = {
  value: string;
  isCorrect: boolean;
};

/**
 * TField - один пропуск в упражнении
 *
 * @property {number} startPosition - начальная позиция пропуска в тексте (опционально)
 * @property {number} id - уникальный идентификатор пропуска (обычно timestamp)
 * @property {TOption[]} options - массив вариантов ответов для этого пропуска
 * @property {string} originalWord - исходное слово/фраза, которая была выделена
 *
 * Пример:
 * {
 *   id: 1701609600000,
 *   options: [
 *     { value: "important", isCorrect: true },
 *     { value: "critical", isCorrect: true },
 *     { value: "wrong", isCorrect: false }
 *   ],
 *   originalWord: "important"
 * }
 */
export type TField = {
  startPosition?: number;
  id: number;
  options: TOption[];
  originalWord: string;
};

/**
 * TFillGapsSelectData - полные данные упражнения "заполни пропуски"
 *
 * @property {number} [id] - уникальный идентификатор упражнения (для редактирования существующего)
 * @property {string} title - название упражнения
 * @property {string} titleColor - цвет заголовка (hex цвет, например "#3F28C6")
 * @property {string} subtitle - подзаголовок упражнения
 * @property {string} description - полное описание упражнения
 * @property {Array<Record<string, string>>} images - массив объектов с путями к изображениям
 * @property {number} [sortIndex] - индекс для сортировки в списке упражнений
 * @property {string} dataText - основной текст с пропусками в виде HTML
 *    (содержит <div class="answerWrapper"> элементы для каждого пропуска)
 * @property {TField[]} fields - массив всех пропусков в упражнении
 *
 * Пример dataText:
 * "This is a <div class="answerWrapper" id="123" answer="[test]"></div> exercise."
 *
 * Пример полного объекта:
 * {
 *   id: 1,
 *   title: "English Test",
 *   titleColor: "#3F28C6",
 *   subtitle: "Level B1",
 *   description: "Fill in the gaps with appropriate words",
 *   images: [{ url: "/images/test.jpg" }],
 *   sortIndex: 5,
 *   dataText: "This is a <div class="answerWrapper">...</div> exercise",
 *   fields: [ ... TField array ... ]
 * }
 */
export type TFillGapsSelectData = {
  id?: number;
  title: string;
  titleColor: string;
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  dataText: string;
  fields: TField[];
};
