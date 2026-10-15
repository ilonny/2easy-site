import { createElement, Fragment, ReactNode, useMemo } from "react";
import {
  parseLegacyGapHtml,
  TGapHtmlNode,
} from "@/app/editor/helpers/fillGapsLegacy";

const ALLOWED_TAGS = new Set([
  "div",
  "span",
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "img",
  "a",
  "blockquote",
  "font",
  "sub",
  "sup",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
]);

const VOID_TAGS = new Set(["br", "img", "hr"]);

function styleToObj(style: string): Record<string, string> | undefined {
  if (!style) return undefined;
  const obj: Record<string, string> = {};
  style.split(";").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx <= 0) return;
    const key = part
      .slice(0, idx)
      .trim()
      .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const value = part.slice(idx + 1).trim();
    if (!key || !value || /expression|javascript:/i.test(value)) return;
    obj[key] = value;
  });
  return Object.keys(obj).length ? obj : undefined;
}

function renderNodes(
  nodes: TGapHtmlNode[],
  renderGap: (id: string, key: string) => ReactNode,
  keyPrefix: string,
): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "text") {
      return <Fragment key={key}>{node.text}</Fragment>;
    }
    if (node.type === "gap") {
      return <Fragment key={key}>{renderGap(node.id, key)}</Fragment>;
    }
    if (
      node.tag === "script" ||
      node.tag === "style" ||
      node.tag === "iframe" ||
      node.tag === "object"
    ) {
      return null;
    }
    const tag = ALLOWED_TAGS.has(node.tag) ? node.tag : "span";
    const props: Record<string, unknown> = { key };
    if (node.attrs.class) props.className = node.attrs.class;
    const style = styleToObj(node.attrs.style || "");
    if (style) props.style = style;
    if (tag === "img") {
      props.src = node.attrs.src || "";
      props.alt = node.attrs.alt || "";
      if (node.attrs.width) props.width = node.attrs.width;
      if (node.attrs.height) props.height = node.attrs.height;
    }
    if (tag === "a") {
      const href = node.attrs.href || "";
      if (/^(https?:|mailto:|\/)/i.test(href)) props.href = href;
      if (node.attrs.target === "_blank") props.target = "_blank";
      props.rel = "noopener noreferrer";
    }
    if (VOID_TAGS.has(tag)) {
      return createElement(tag, props);
    }
    return createElement(
      tag,
      props,
      ...renderNodes(node.children, renderGap, key),
    );
  });
}

export function LegacyGapHtml({
  html,
  renderGap,
}: {
  html: string;
  renderGap: (id: string, key: string) => ReactNode;
}) {
  const nodes = useMemo(() => parseLegacyGapHtml(html), [html]);
  return <>{renderNodes(nodes, renderGap, "g")}</>;
}
