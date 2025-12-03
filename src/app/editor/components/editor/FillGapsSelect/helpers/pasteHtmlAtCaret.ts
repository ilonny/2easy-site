/**
 * Вставляет HTML элемент в место курсора в contentEditable элементе
 *
 * Функция работает следующим образом:
 * 1. Получает текущее выделение (selection) в contentEditable
 * 2. Получает диапазон выделения (range)
 * 3. Удаляет выделенный текст (deleteContents)
 * 4. Парсит переданный HTML и создает фрагмент DOM
 * 5. Вставляет этот фрагмент в место курсора
 *
 * Используется для создания пропусков - когда пользователь выделяет слово,
 * эта функция вставляет div с классом "answerWrapper" на его место.
 *
 * @param {string} html - HTML строка для вставки
 *
 * @example
 * // Вставить div пропуска вместо выделенного текста
 * pasteHtmlAtCaret(
 *   '<div class="answerWrapper" id="123" answer="[selected]"></div>'
 * );
 *
 * Процесс работы:
 * Исходный текст: "This is [important] text"
 *                           ^^^^^^^^^ (выделено)
 * 
 * После вызова:  "This is <div class="answerWrapper">...</div> text"
 *
 * @note Эта функция НЕ меняет выделение после вставки
 * @note Работает только если contentEditable элемент имеет фокус
 */
export function pasteHtmlAtCaret(html: string) {
  let sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (!sel) {
      return;
    }
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      // Удаляем выделенный текст
      range.deleteContents();

      // Парсим HTML
      const el = document.createElement("div");
      el.innerHTML = html;
      
      // Создаем фрагмент из HTML элементов
      let frag = document.createDocumentFragment(),
        node,
        lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      
      // Вставляем фрагмент в место курсора
      range.insertNode(frag);
    }
  }
}

