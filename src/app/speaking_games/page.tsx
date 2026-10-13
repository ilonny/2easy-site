"use client";

import { CatalogPageShell } from "@/components";
import {
  catalogGridClassName,
  GameCard,
  TGameCard,
} from "@/components/MainContent/GameCard";
import { TTagTone } from "@/components/Tag";
import { T } from "@/i18n/T";
import { data } from "./data";

const metaByKey: Record<
  string,
  {
    count?: number | string;
    countKey?: string;
    isVideo?: boolean;
    level?: string;
    levelTone?: TTagTone;
  }
> = {
  "games.bingo": {
    count: 5,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  "games.taboo": {
    count: 90,
    countKey: "content.cardsCount",
    level: "A2-B2+ SLANG",
    levelTone: "blue",
  },
  "games.neverHaveIEver": {
    count: 130,
    countKey: "content.cardsCount",
    level: "A2-B2",
    levelTone: "mint",
  },
  "games.wouldYouRather": {
    count: 50,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  "games.ifYouCould": {
    count: 30,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  "games.whatHappensNext": {
    count: 30,
    countKey: "content.videosCount",
    isVideo: true,
    level: "A2-B2",
    levelTone: "mint",
  },
  "games.whatHappensNextFilms": {
    count: 30,
    countKey: "content.videosCount",
    isVideo: true,
    level: "A2-B2",
    levelTone: "mint",
  },
  "games.nameThree": {
    count: 90,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
};

const cards: TGameCard[] = data.map((el) => ({
  titleKey: `${el.key}.title`,
  descriptionKey: `${el.key}.description`,
  href: el.link,
  image: el.img,
  ...metaByKey[el.key],
}));

export default function SpeakingGamesPage() {
  return (
    <CatalogPageShell
      title={<T k="home.speakingGamesSection" />}
      subtitle={<T k="home.speakingGamesSectionDesc" />}
    >
      <div className={catalogGridClassName}>
        {cards.map((card) => (
          <GameCard key={card.href} card={card} />
        ))}
      </div>
    </CatalogPageShell>
  );
}
