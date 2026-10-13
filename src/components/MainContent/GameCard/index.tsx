import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { T } from "@/i18n/T";
import { LevelIcon, Tag, TTagTone } from "@/components/Tag";
import CardsIcon from "@/assets/icons/cards_stack.svg";
import PlayIcon from "@/assets/icons/play_violet.svg";

export type TGameCard = {
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  href?: string;
  /** Local asset or an absolute URL from the API. */
  image?: StaticImageData | string;
  /** Background of the cover when there is no image yet. */
  coverClassName?: string;
  count?: number | string;
  countKey?: string;
  isVideo?: boolean;
  /** Free-form tag such as a grammar topic, shown after the level. */
  topic?: string;
  level?: string;
  levelTone?: TTagTone;
};

type TProps = {
  card: TGameCard;
  onClick?: () => void;
  className?: string;
};

const coverImageClassName =
  "object-cover transition-transform duration-300 group-hover:scale-[1.03]";

export const catalogGridClassName =
  "-mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-5 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-x-[15px] md:gap-y-[35px] md:overflow-visible md:px-0 lg:gap-x-4 lg:gap-y-[30px] wide:grid-cols-4 [&::-webkit-scrollbar]:hidden";

const GameCardBody = ({ card }: { card: TGameCard }) => (
  <>
    <span
      className={`relative aspect-square w-full overflow-hidden rounded-[20px] bg-brand-gray lg:rounded-[30px] ${card.coverClassName ?? ""}`}
    >
      {typeof card.image === "string" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 size-full ${coverImageClassName}`}
        />
      ) : (
        card.image && (
          <Image
            src={card.image}
            alt=""
            fill
            sizes="(min-width: 1440px) 315px, (min-width: 1024px) 346px, 250px"
            className={coverImageClassName}
          />
        )
      )}
    </span>
    <span className="flex flex-col gap-3">
      <span className="flex min-w-0 items-center gap-[5px]">
        {card.countKey && (
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
            <T
              k={card.countKey}
              values={{ n: card.count, count: card.count }}
            />
          </Tag>
        )}
        {card.level && (
          <Tag tone={card.levelTone} icon={<LevelIcon />}>
            {card.level}
          </Tag>
        )}
        {card.topic && (
          <Tag className="min-w-0 !shrink">
            <span className="min-w-0 truncate">{card.topic}</span>
          </Tag>
        )}
      </span>
      <span className="text-sm font-bold leading-[1.3] tracking-brand text-brand-black lg:text-base lg:leading-[22px] lg:tracking-normal">
        {card.titleKey ? <T k={card.titleKey} /> : card.title}
      </span>
      {(card.descriptionKey || card.description) && (
        <span className="line-clamp-2 text-sm font-bold leading-[1.3] tracking-brand text-brand-grayFont lg:line-clamp-3 lg:leading-[19px]">
          {card.descriptionKey ? (
            <T k={card.descriptionKey} />
          ) : (
            card.description
          )}
        </span>
      )}
    </span>
  </>
);

const cardClassName =
  "group flex w-[230px] shrink-0 snap-start flex-col gap-3.5 text-left md:w-auto";

export const GameCard = ({ card, onClick, className = "" }: TProps) => {
  const classes = `${cardClassName} ${className}`;

  if (onClick || !card.href) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        <GameCardBody card={card} />
      </button>
    );
  }

  return (
    <Link href={card.href} className={classes}>
      <GameCardBody card={card} />
    </Link>
  );
};
