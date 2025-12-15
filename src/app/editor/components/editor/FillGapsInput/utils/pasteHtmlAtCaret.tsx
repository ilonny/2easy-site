import {TField} from "@/app/editor/components/editor/FillGapsInput/types";
import ReactDOM from "react-dom/client";
import {PopoverFields} from "@/app/editor/components/editor/FillGapsInput/PopoverFields";

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


export function pasteReactAtCaretUpdate(
    id: string,
    field: TField,
    addItemState: { selection: string; left?: number; top?: number },
) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  range.deleteContents();

  const wrapper = document.createElement("div");
  wrapper.className = "inline-block answerWrapper";
  wrapper.contentEditable = "false";
  wrapper.id = id;
  wrapper.setAttribute("answer", `[${addItemState.selection}]`);
  wrapper.setAttribute("index", field.id);

  range.insertNode(wrapper);
  range.collapse(false);

  const space = document.createTextNode("\u00A0");
  wrapper.after(space);

  return wrapper
}
