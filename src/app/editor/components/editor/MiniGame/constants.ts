import { TMiniGameKind } from "./types";

export const MINI_GAME_META: Array<{
  id: TMiniGameKind;
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
}> = [
  {
    id: "flash-cards",
    titleKey: "templates.miniGameFlashCards",
    titleDefault: "Flash cards",
    descKey: "templates.miniGameFlashCardsDesc",
    descDefault: "Односторонние/двусторонние карточки",
  },
  {
    id: "matching-pairs",
    titleKey: "templates.miniGameMatchingPairs",
    titleDefault: "Matching pairs",
    descKey: "templates.miniGameMatchingPairsDesc",
    descDefault: "Memory: найди пары",
  },
  {
    id: "spin-wheel",
    titleKey: "templates.miniGameSpinWheel",
    titleDefault: "Spin the wheel",
    descKey: "templates.miniGameSpinWheelDesc",
    descDefault: "Колесо со словами",
  },
  {
    id: "hangman",
    titleKey: "templates.miniGameHangman",
    titleDefault: "Hangman",
    descKey: "templates.miniGameHangmanDesc",
    descDefault: "Угадай слово по буквам",
  },
  {
    id: "wordsearch",
    titleKey: "templates.miniGameWordsearch",
    titleDefault: "Wordsearch",
    descKey: "templates.miniGameWordsearchDesc",
    descDefault: "Найди слова в сетке",
  },
];
