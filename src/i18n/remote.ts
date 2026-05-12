"use client";

import i18n from "./config";
import { apiGetTranslations } from "@/api/translations";

type AnyJson = Record<string, any>;

/** Backend JSON sometimes stores dotted paths as literal keys (e.g. "templates.fillGaps"). i18next expects nesting. */
function setByDotPath(target: AnyJson, dotPath: string, value: any) {
  const parts = String(dotPath || "")
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return;
  let cur: AnyJson = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = cur[key];
    if (typeof next !== "object" || next === null || Array.isArray(next)) {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

/** Turn { "a.b": "x", a: { c: 1 } } into a deep tree; dotted keys win on conflicts (backend overrides). */
function expandDottedKeysInTree(node: AnyJson): AnyJson {
  if (!node || typeof node !== "object" || Array.isArray(node)) return node;
  const dotted: AnyJson = {};
  const rest: AnyJson = {};
  for (const [k, v] of Object.entries(node)) {
    if (k.includes(".")) {
      setByDotPath(dotted, k, v);
    } else {
      rest[k] =
        v && typeof v === "object" && !Array.isArray(v)
          ? expandDottedKeysInTree(v as AnyJson)
          : v;
    }
  }
  return deepMerge(rest, dotted);
}

/** Older builds stored template strings under `editor.templates.*`; UI expects `templates.*`. */
function hoistLegacyEditorTemplatesIntoTemplates(tree: AnyJson): AnyJson {
  if (!tree || typeof tree !== "object") return tree;
  const legacy = tree.editor?.templates;
  if (!legacy || typeof legacy !== "object") return tree;
  const mergedTemplates = deepMerge(
    (tree.templates || {}) as AnyJson,
    expandDottedKeysInTree(legacy as AnyJson)
  );
  return { ...tree, templates: mergedTemplates };
}

function deepMerge(base: AnyJson, override: AnyJson): AnyJson {
  const out: AnyJson = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(override || {})) {
    const prev = (out as any)[k];
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      prev &&
      typeof prev === "object" &&
      !Array.isArray(prev)
    ) {
      (out as any)[k] = deepMerge(prev, v as AnyJson);
    } else {
      (out as any)[k] = v;
    }
  }
  return out;
}

export async function loadRemoteTranslationsIntoI18n() {
  try {
    const payload = await apiGetTranslations();
    if (!payload?.success || !payload.ru || !payload.en) {
      throw new Error(payload?.message || "Failed to load translations");
    }

    const remoteRu = hoistLegacyEditorTemplatesIntoTemplates(
      expandDottedKeysInTree(payload.ru as AnyJson)
    );
    const remoteEn = hoistLegacyEditorTemplatesIntoTemplates(
      expandDottedKeysInTree(payload.en as AnyJson)
    );

    // Force backend translations to take priority over bundled ones.
    const localRu = (i18n.getResourceBundle("ru", "translation") || {}) as AnyJson;
    const localEn = (i18n.getResourceBundle("en", "translation") || {}) as AnyJson;
    const mergedRu = deepMerge(localRu, remoteRu);
    const mergedEn = deepMerge(localEn, remoteEn);

    i18n.removeResourceBundle("ru", "translation");
    i18n.removeResourceBundle("en", "translation");
    i18n.addResourceBundle("ru", "translation", mergedRu, true, true);
    i18n.addResourceBundle("en", "translation", mergedEn, true, true);
    // No i18next backend: reloadResources is a no-op and can confuse debugging.
    try {
      i18n.emit("languageChanged", i18n.language);
    } catch {}
    return;
  } catch {
    // We already ship local dictionaries in i18n.init().
    // If remote load fails, keep the currently loaded resources (do NOT overwrite).
    return;
  }
}

