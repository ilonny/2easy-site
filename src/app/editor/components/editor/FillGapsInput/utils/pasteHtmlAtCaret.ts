/**
 * Вставляет HTML в позицию курсора в contentEditable элементе
 * Использует Selection API для получения текущего положения курсора
 * и Range API для вставки содержимого
 * @param html - HTML строка для вставки
 */
export function pasteHtmlAtCaret(html: string) {
  let sel, range;
  if (window.getSelection) {
    // IE9 and non-IE
    sel = window.getSelection();
    if (!sel) {
      return;
    }
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();

      // Range.createContextualFragment() would be useful here but is
      // non-standard and not supported in all browsers (IE9, for one)
      const el = document.createElement("div");
      el.innerHTML = html;
      let frag = document.createDocumentFragment(),
        node,
        lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
    }
  }
}
