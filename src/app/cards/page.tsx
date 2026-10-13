"use client";

import { CatalogPageShell } from "@/components";
import {
  catalogGridClassName,
  GameCard,
  TGameCard,
} from "@/components/MainContent/GameCard";
import { T } from "@/i18n/T";
import { data } from "./data";

const metaByKey: Record<
  string,
  { count: string; countKey: string; level: string; levelTone: "green" }
> = {
  "games.discussionCards": {
    count: "140+",
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  "games.controversial": {
    count: "30",
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  "games.firstMeeting": {
    count: "30",
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

export default function CardsPage() {
  return (
    <CatalogPageShell
      title={<T k="home.discussionCardsSection" />}
      subtitle={<T k="home.discussionCardsSectionDesc" />}
    >
      <div className={catalogGridClassName}>
        {cards.map((card) => (
          <GameCard key={card.href} card={card} />
        ))}
      </div>
    </CatalogPageShell>
  );
}
