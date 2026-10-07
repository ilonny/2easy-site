import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import { LoopVideo } from "@/components/LoopVideo";
import CardTemplates from "@/assets/images/hero/card_templates.jpg";
import CardIntegrations from "@/assets/images/hero/card_integrations.jpg";
import CardCourses from "@/assets/images/hero/card_courses.jpg";
import CardAi from "@/assets/images/hero/card_ai.jpg";
import CardBoards from "@/assets/images/hero/card_boards.jpg";

type TCard = {
  titleKey: string;
  image: StaticImageData;
  video?: string;
  lightText?: boolean;
};

const cards: TCard[] = [
  { titleKey: "hero.cardTemplates", image: CardTemplates, lightText: true },
  { titleKey: "hero.cardIntegrations", image: CardIntegrations },
  {
    titleKey: "hero.cardCourses",
    image: CardCourses,
    video: "/video/landing/hero-courses.mp4",
  },
  { titleKey: "hero.cardAi", image: CardAi },
  {
    titleKey: "hero.cardBoards",
    image: CardBoards,
    video: "/video/landing/hero-boards.mp4",
  },
];

// Every other card sits lower. With an odd number of cards one pass would end and the next
// begin at the same height, so the ribbon repeats the set twice to keep the zigzag even.
const ribbon = cards.length % 2 ? [...cards, ...cards] : cards;

const HeroCard = ({ card, shifted }: { card: TCard; shifted: boolean }) => (
  <div className={`shrink-0 pr-5 ${shifted ? "pt-5 lg:pt-[70px]" : ""}`}>
    <div className="relative isolate flex h-[282px] w-[230px] flex-col justify-end overflow-hidden rounded-[20px] p-[25px] lg:h-[409px] lg:w-[333px] lg:rounded-[30px] lg:p-[30px] wide:h-[470px] wide:w-[383px]">
      <Image
        src={card.image}
        alt=""
        fill
        sizes="(min-width: 1440px) 383px, (min-width: 1024px) 333px, 230px"
        className="pointer-events-none z-0 object-cover"
      />
      {card.video && (
        <LoopVideo
          src={card.video}
          className="absolute inset-0 z-0 size-full object-cover"
        />
      )}
      <p
        className={`relative z-10 text-sm font-bold leading-[1.3] tracking-brand [transform:translateZ(0)] lg:text-[22px] lg:leading-[1.2] ${
          card.lightText ? "text-white" : "text-brand-black"
        }`}
      >
        <T k={card.titleKey} />
      </p>
    </div>
  </div>
);

// Endless ribbon: the track holds two copies of the ribbon and slides by half its width.
export const HeroCards = () => {
  return (
    <div className="overflow-hidden pl-5 pt-5 [--marquee-duration:64s] motion-reduce:overflow-x-auto lg:pl-[65px] lg:[--marquee-duration:90s]">
      <div className="flex w-max animate-marquee items-start motion-reduce:animate-none">
        {ribbon.map((card, index) => (
          <div
            key={`${card.titleKey}-${index}`}
            className="contents"
            aria-hidden={index >= cards.length || undefined}
          >
            <HeroCard card={card} shifted={index % 2 === 1} />
          </div>
        ))}
        <div className="contents" aria-hidden>
          {ribbon.map((card, index) => (
            <HeroCard
              key={`${card.titleKey}-${index}`}
              card={card}
              shifted={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
