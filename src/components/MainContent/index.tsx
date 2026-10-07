"use client";
import { useId, useState } from "react";
import { T } from "@/i18n/T";
import { useUserAccess } from "@/app/subscription/helpers";
import { landingContainerClassName } from "@/constants/layout";
import { ContentCategories } from "./ContentCategories";
import { GameCard, TGameCard } from "./GameCard";
import { TryFreeCard } from "./TryFreeCard";
import { TContentTab, useTabCards } from "./useTabCards";
import GameNever from "@/assets/images/content/game_never.jpg";
import GameTaboo from "@/assets/images/content/game_taboo.jpg";
import GameNext from "@/assets/images/content/game_next.jpg";
import GameRather from "@/assets/images/content/game_rather.jpg";
import GameBingo from "@/assets/images/content/game_bingo.jpg";
import GameNameThree from "@/assets/images/content/game_name_three.jpg";
import GameIfYouCould from "@/assets/images/content/game_if_you_could.jpg";

const games: TGameCard[] = [
  {
    title: "Never have I ever",
    descriptionKey: "content.neverDesc",
    href: "/speaking_games/never_have_i_ever",
    image: GameNever,
    count: 130,
    countKey: "content.cardsCount",
    level: "A2-B2",
    levelTone: "mint",
  },
  {
    title: "Taboo game",
    descriptionKey: "content.tabooDesc",
    href: "/speaking_games/taboo",
    image: GameTaboo,
    count: 90,
    countKey: "content.cardsCount",
    level: "A2-B2+ SLANG",
    levelTone: "blue",
  },
  {
    title: "What happens next",
    descriptionKey: "content.nextDesc",
    href: "/speaking_games/what_happens_next",
    image: GameNext,
    count: 30,
    countKey: "content.videosCount",
    isVideo: true,
    level: "A2-B2",
    levelTone: "mint",
  },
  {
    title: "Would you rather",
    descriptionKey: "content.ratherDesc",
    href: "/speaking_games/would_you_rather",
    image: GameRather,
    count: 50,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  {
    title: "Bingo",
    descriptionKey: "content.bingoDesc",
    href: "/speaking_games/bingo",
    image: GameBingo,
    count: 5,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  {
    title: "Name three",
    descriptionKey: "content.nameThreeDesc",
    href: "/speaking_games/name_three",
    image: GameNameThree,
    count: 90,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  {
    title: "If you could",
    descriptionKey: "content.ifYouCouldDesc",
    href: "/speaking_games/if_you_could",
    image: GameIfYouCould,
    count: 30,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
];

const SKELETON_COUNT = 7;

const CardSkeleton = () => (
  <div
    className="flex w-[230px] shrink-0 flex-col gap-3.5 md:w-auto"
    aria-hidden
  >
    <span className="aspect-square w-full animate-pulse rounded-[20px] bg-brand-gray lg:rounded-[30px]" />
    <span className="flex flex-col gap-3">
      <span className="h-6 w-1/2 animate-pulse rounded-2xl bg-brand-gray" />
      <span className="h-5 w-3/4 animate-pulse rounded-lg bg-brand-gray" />
      <span className="h-10 w-full animate-pulse rounded-lg bg-brand-gray" />
    </span>
  </div>
);

export const MainContent = () => {
  const access = useUserAccess();
  const panelId = useId();
  const [tab, setTab] = useState<TContentTab>("speaking");
  const tabData = useTabCards(tab, access);
  const cards = tab === "speaking" ? games : tabData.cards;
  const showSkeletons =
    tab !== "speaking" && tabData.isLoading && !tabData.isError;
  const showError = !showSkeletons && cards.length === 0;

  return (
    <section
      className={`${landingContainerClassName} flex flex-col gap-[30px] lg:gap-[50px]`}
    >
      <h2 className="mx-auto max-w-[440px] text-center text-[25px] font-bold leading-none tracking-brand text-brand-black lg:max-w-[550px] lg:text-[40px]">
        <T k="content.title" />
      </h2>
      <ContentCategories active={tab} onChange={setTab} panelId={panelId} />
      {showError ? (
        <p
          id={panelId}
          role="tabpanel"
          className="py-10 text-center text-sm font-bold tracking-brand text-brand-grayFont lg:text-base"
        >
          <T k="content.loadError" />
        </p>
      ) : (
        <div
          key={tab}
          id={panelId}
          role="tabpanel"
          aria-busy={showSkeletons}
          className="-mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-5 overflow-x-auto px-5 [scrollbar-width:none] motion-safe:animate-content-in md:mx-0 md:grid md:grid-cols-3 md:gap-x-[15px] md:gap-y-[35px] md:overflow-visible md:px-0 lg:gap-x-4 lg:gap-y-[30px] wide:grid-cols-4 [&::-webkit-scrollbar]:hidden"
        >
          {showSkeletons
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <CardSkeleton key={i} />
              ))
            : cards.map((card, index) => (
                <GameCard key={`${tab}-${index}`} card={card} />
              ))}
          {access === "guest" && (
            <TryFreeCard
              tab={tab}
              href="/registration"
              buttonKey="content.tryButton"
            />
          )}
          {access === "noSubscription" && (
            <TryFreeCard
              tab={tab}
              href="/subscription"
              buttonKey="header.chooseTariff"
            />
          )}
        </div>
      )}
    </section>
  );
};
