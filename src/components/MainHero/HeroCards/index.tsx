import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import CardTemplates from "@/assets/images/hero/card_templates.jpg";
import CardIntegrations from "@/assets/images/hero/card_integrations.jpg";
import CardCourses from "@/assets/images/hero/card_courses.jpg";
import CardAi from "@/assets/images/hero/card_ai.jpg";
import CardBoards from "@/assets/images/hero/card_boards.jpg";

type TCard = {
  titleKey: string;
  image: StaticImageData;
  lightText?: boolean;
  shifted?: boolean;
};

const cards: TCard[] = [
  { titleKey: "hero.cardTemplates", image: CardTemplates, lightText: true },
  { titleKey: "hero.cardIntegrations", image: CardIntegrations, shifted: true },
  { titleKey: "hero.cardCourses", image: CardCourses },
  { titleKey: "hero.cardAi", image: CardAi, shifted: true },
  { titleKey: "hero.cardBoards", image: CardBoards },
];

export const HeroCards = () => {
  return (
    <div className="flex snap-x snap-mandatory scroll-pl-5 items-start gap-5 overflow-x-auto overflow-y-hidden px-5 pt-5 [scrollbar-width:none] lg:scroll-pl-[65px] lg:px-[65px] [&::-webkit-scrollbar]:hidden">
      {cards.map((card) => (
        <div
          key={card.titleKey}
          className={`shrink-0 snap-start ${card.shifted ? "pt-5 lg:pt-[70px]" : ""}`}
        >
          <div className="relative flex h-[282px] w-[230px] flex-col justify-end overflow-hidden rounded-[20px] p-[25px] lg:h-[470px] lg:w-[383px] lg:rounded-[30px] lg:p-[30px]">
            <Image
              src={card.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 383px, 230px"
              className="pointer-events-none object-cover"
            />
            <p
              className={`relative text-sm font-bold leading-[1.3] tracking-brand lg:text-[22px] lg:leading-[1.2] ${
                card.lightText ? "text-white" : "text-brand-black"
              }`}
            >
              <T k={card.titleKey} />
            </p>
          </div>
        </div>
      ))}
      <div className="w-0 shrink-0 lg:w-[45px]" aria-hidden />
    </div>
  );
};
