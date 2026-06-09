import { TDictionaryItem } from "../types";

export type TDictionaryLanguageGroup = {
  key: string;
  label: string;
  items: TDictionaryItem[];
};

export const groupByLanguagePair = (
  items: TDictionaryItem[],
  getLanguageName: (code: string) => string
): TDictionaryLanguageGroup[] => {
  const groups = new Map<string, TDictionaryItem[]>();

  for (const item of items) {
    const key = `${item.sourceLanguageCode}:${item.targetLanguageCode}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  return Array.from(groups.entries()).map(([key, groupItems]) => {
    const [sourceCode, targetCode] = key.split(":");
    return {
      key,
      label: `${getLanguageName(sourceCode)} → ${getLanguageName(targetCode)}`,
      items: groupItems,
    };
  });
};
