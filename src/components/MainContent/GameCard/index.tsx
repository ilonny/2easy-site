import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { T } from "@/i18n/T";
import { LevelIcon, Tag, TTagTone } from "@/components/Tag";
import CardsIcon from "@/assets/icons/cards_stack.svg";
import PlayIcon from "@/assets/icons/play_violet.svg";

export type TGameCard = {
  title: string;
  descriptionKey: string;
  href: string;
  image?: StaticImageData;
  /** Background of the cover when there is no image yet. */
  coverClassName?: string;
  count: number;
  countKey: string;
  isVideo?: boolean;
  level: string;
  levelTone: TTagTone;
};

type TProps = {
  card: TGameCard;
};

export const GameCard = ({ card }: TProps) => {
  return (
    <Link
      href={card.href}
      className="group flex w-[230px] shrink-0 snap-start flex-col gap-3.5 md:w-auto"
    >
      <span
        className={`relative aspect-square w-full overflow-hidden rounded-[20px] lg:rounded-[30px] ${card.coverClassName ?? ""}`}
      >
        {card.image && (
          <Image
            src={card.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 315px, 250px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </span>
      <span className="flex flex-col gap-3">
        <span className="flex items-center gap-[5px]">
          <Tag
            icon={
              card.isVideo ? (
                <span className="relative size-[15px] shrink-0">
                  <Image
                    src={PlayIcon}
                    alt=""
                    aria-hidden
                    className="absolute left-[2.6px] top-[2.19px]"
                  />
                </span>
              ) : (
                <Image src={CardsIcon} alt="" aria-hidden />
              )
            }
          >
            <T k={card.countKey} values={{ n: card.count }} />
          </Tag>
          <Tag tone={card.levelTone} icon={<LevelIcon />}>
            {card.level}
          </Tag>
        </span>
        <span className="text-sm font-bold leading-[1.3] tracking-brand text-brand-black lg:text-base lg:leading-[22px] lg:tracking-normal">
          {card.title}
        </span>
        <T
          k={card.descriptionKey}
          className="line-clamp-2 text-sm font-bold leading-[1.3] tracking-brand text-brand-grayFont lg:line-clamp-3 lg:leading-[19px]"
        />
      </span>
    </Link>
  );
};
