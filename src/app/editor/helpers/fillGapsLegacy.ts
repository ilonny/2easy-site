import type { TField, TFieldOption } from "../components/editor/FillGapsSelect/types";

/** Старые упражнения: options пустой или в нестандартном виде → Math.max(...[]) даёт -Infinity и селект схлопывается. */
export function normalizeFieldOptions(raw: unknown): TFieldOption[] {
  if (raw == null) return [];
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } else {
    return [];
  }

  const out: TFieldOption[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    let opt: TFieldOption | null = null;
    if (item == null) continue;
    if (typeof item === "string") {
      const v = item.trim();
      if (!v) continue;
      opt = { value: v, isCorrect: false };
    } else if (typeof item === "object") {
      const o = item as Record<string, unknown>;
      const rawVal = o.value ?? o.label ?? o.text;
      if (rawVal == null) continue;
      const v = String(rawVal).trim();
      if (!v) continue;
      opt = {
        value: v,
        isCorrect: Boolean(o.isCorrect),
      };
    }
    if (opt && !seen.has(opt.value)) {
      seen.add(opt.value);
      out.push(opt);
    }
  }
  return out;
}

export function normalizeField(field: TField | undefined): TField | undefined {
  if (!field) return undefined;
  return {
    ...field,
    options: normalizeFieldOptions(field.options),
  };
}

export function maxOptionTextLength(options: TFieldOption[]): number {
  const lengths = options
    .map((o) => String(o?.value ?? "").length)
    .filter((n) => n > 0);
  return lengths.length > 0 ? Math.max(...lengths) : 8;
}

export function computeSelectWrapperMinWidth(maxOptionLength: number): number {
  let minWidth =
    maxOptionLength *
    (maxOptionLength <= 5
      ? 75
      : maxOptionLength <= 10
        ? 20
        : maxOptionLength >= 20
          ? 10
          : 15);
  if (!Number.isFinite(minWidth) || minWidth < 70) {
    minWidth = 85;
  }
  return minWidth;
}
