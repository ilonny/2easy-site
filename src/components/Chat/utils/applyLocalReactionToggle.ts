import { canonicalizeChatEmoji } from "../constants";
import type { TChatReaction } from "../types";

/** Optimistic local toggle: one reaction per current user. */
export const applyLocalReactionToggle = (
  reactions: TChatReaction[] | undefined,
  emoji: string,
): TChatReaction[] => {
  const canonical = canonicalizeChatEmoji(emoji);
  if (!canonical) return reactions || [];

  const list = [...(reactions || [])];
  const mineIdx = list.findIndex((r) => r.reacted_by_me);
  const mine = mineIdx >= 0 ? list[mineIdx] : null;
  const mineCanonical = mine
    ? canonicalizeChatEmoji(mine.emoji) || mine.emoji
    : null;

  if (mine && mineIdx >= 0) {
    if (mine.count <= 1) {
      list.splice(mineIdx, 1);
    } else {
      list[mineIdx] = {
        ...mine,
        count: mine.count - 1,
        reacted_by_me: false,
      };
    }
  }

  if (mineCanonical === canonical) {
    return list.filter((r) => r.count > 0);
  }

  const existingIdx = list.findIndex(
    (r) => (canonicalizeChatEmoji(r.emoji) || r.emoji) === canonical,
  );
  if (existingIdx >= 0) {
    const current = list[existingIdx];
    list[existingIdx] = {
      ...current,
      emoji: canonical,
      count: current.count + 1,
      reacted_by_me: true,
    };
  } else {
    list.push({ emoji: canonical, count: 1, reacted_by_me: true });
  }
  return list;
};
