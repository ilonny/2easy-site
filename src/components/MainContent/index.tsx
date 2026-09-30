"use client";
import { T } from "@/i18n/T";
import { useUserAccess } from "@/app/subscription/helpers";
import { landingContainerClassName } from "@/constants/layout";
import { ContentCategories } from "./ContentCategories";
import { GameCard, TGameCard } from "./GameCard";
import { TryFreeCard } from "./TryFreeCard";
import GameNever from "@/assets/images/content/game_never.jpg";
import GameTaboo from "@/assets/images/content/game_taboo.jpg";
import GameNext from "@/assets/images/content/game_next.jpg";
import GameRather from "@/assets/images/content/game_rather.jpg";
import GameBingo from "@/assets/images/content/game_bingo.jpg";

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
    title: "If you could",
    descriptionKey: "content.ifYouCouldDesc",
    href: "/speaking_games/if_you_could",
    coverClassName: "bg-gradient-to-b from-[#C9BBFF] to-[#F1EDFF] to-[91.25%]",
    count: 30,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
  {
    title: "Name three",
    descriptionKey: "content.nameThreeDesc",
    href: "/speaking_games/name_three",
    coverClassName: "bg-[#A9F2EE]",
    count: 90,
    countKey: "content.cardsCount",
    level: "A2+",
    levelTone: "green",
  },
];

export const MainContent = () => {
  const access = useUserAccess();

  return (
    <section
      className={`${landingContainerClassName} flex flex-col gap-[30px] lg:gap-[50px]`}
    >
      <h2 className="mx-auto max-w-[440px] text-center text-[25px] font-bold leading-none tracking-brand text-brand-black lg:max-w-[550px] lg:text-[40px]">
        <T k="content.title" />
      </h2>
      <ContentCategories />
      <div className="-mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-5 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-x-[15px] md:gap-y-[35px] md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-[30px] [&::-webkit-scrollbar]:hidden">
        {games.map((game) => (
          <GameCard key={game.href} card={game} />
        ))}
        {access === "guest" && (
          <TryFreeCard href="/registration" buttonKey="content.tryButton" />
        )}
        {access === "noSubscription" && (
          <TryFreeCard href="/subscription" buttonKey="header.chooseTariff" />
        )}
      </div>
    </section>
  );
};
