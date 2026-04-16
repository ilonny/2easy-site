"use client";

import i18n from "./config";
import { apiGetTranslations } from "@/api/translations";

type AnyJson = Record<string, any>;

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

    // Force backend translations to take priority over bundled ones.
    const localRu = (i18n.getResourceBundle("ru", "translation") || {}) as AnyJson;
    const localEn = (i18n.getResourceBundle("en", "translation") || {}) as AnyJson;
    const mergedRu = deepMerge(localRu, payload.ru as AnyJson);
    const mergedEn = deepMerge(localEn, payload.en as AnyJson);

    i18n.removeResourceBundle("ru", "translation");
    i18n.removeResourceBundle("en", "translation");
    i18n.addResourceBundle("ru", "translation", mergedRu, true, true);
    i18n.addResourceBundle("en", "translation", mergedEn, true, true);
    i18n.reloadResources(["ru", "en"], ["translation"]);
    return;
  } catch {
    // We already ship local dictionaries in i18n.init().
    // If remote load fails, keep the currently loaded resources (do NOT overwrite).
    return;
  }
}

