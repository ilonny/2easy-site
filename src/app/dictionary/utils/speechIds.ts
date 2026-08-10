export const buildSpeakWordId = (itemId: number, suffix?: string) =>
  suffix ? `word-${itemId}-${suffix}` : `word-${itemId}`;

