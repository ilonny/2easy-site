import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import FloatInked from "@/assets/images/hero/float_inked.jpg";
import FloatFake from "@/assets/images/hero/float_fake.jpg";
import Avatar1 from "@/assets/images/hero/avatar_1.png";
import Avatar2 from "@/assets/images/hero/avatar_2.png";
import Thumb1 from "@/assets/images/hero/thumb_1.jpg";
import Thumb2 from "@/assets/images/hero/thumb_2.jpg";
import Thumb3 from "@/assets/images/hero/thumb_3.jpg";
import Thumb4 from "@/assets/images/hero/thumb_4.jpg";
import FolderShape from "@/assets/images/hero/folder.svg";
import CurveShape from "@/assets/images/hero/curve.svg";
import PointerIcon from "@/assets/images/hero/pointer.svg";
import PlusIcon from "@/assets/icons/plus_dark.svg";

const itemClassName =
  "absolute origin-top-left scale-[0.668] lg:scale-[0.869] wide:scale-100";

type TFloatCardProps = {
  title: string;
  tag: string;
  tagClassName: string;
  children: React.ReactNode;
};

const FloatCard = ({ title, tag, tagClassName, children }: TFloatCardProps) => (
  <div className="flex w-40 flex-col gap-[9.581px] rounded-[24px] bg-white px-2 pb-[11px] pt-2 drop-shadow-[0px_3.832px_20.263px_rgba(0,0,0,0.13)]">
    {children}
    <div className="flex flex-col items-start gap-[7.665px] px-[11.189px]">
      <p className="text-[10px] font-bold leading-none tracking-brand text-brand-black">
        {title}
      </p>
      <span
        className={`rounded-full px-[5.594px] py-[2.874px] text-[9.236px] font-bold leading-[7px] tracking-brand ${tagClassName}`}
      >
        {tag}
      </span>
    </div>
  </div>
);

const curveLetters = [
  {
    char: "т",
    left: 123.28,
    top: 13.96,
    width: 12.701,
    height: 19.696,
    rotate: 11.6,
  },
  {
    char: "и",
    left: 132.37,
    top: 17.39,
    width: 16.619,
    height: 20.807,
    rotate: 22.83,
  },
  {
    char: "ч",
    left: 141.95,
    top: 23.11,
    width: 18.459,
    height: 20.626,
    rotate: 34.37,
  },
  {
    char: "е",
    left: 150.18,
    top: 30.93,
    width: 20.498,
    height: 20.309,
    rotate: 46.01,
  },
  {
    char: "р",
    left: 157.61,
    top: 40.9,
    width: 21.161,
    height: 18.762,
    rotate: 58.2,
  },
  {
    char: "с",
    left: 163.28,
    top: 51.99,
    width: 20.553,
    height: 15.663,
    rotate: 70.17,
  },
];

const TeachersBadge = () => (
  <div className="relative h-[103px] w-[184px]">
    <div className="absolute left-3.5 top-[24.98px] w-[149.896px] rounded-full bg-white p-[7.994px] drop-shadow-[0px_0px_63.906px_rgba(0,0,0,0.24)]">
      <div className="flex items-center">
        {[Avatar1, Avatar2].map((avatar, index) => (
          <Image
            key={index}
            src={avatar}
            alt=""
            className="mr-[-15.989px] size-[53.963px] shrink-0"
          />
        ))}
        <span className="flex size-[53.963px] shrink-0 items-center justify-center rounded-full bg-brand-green">
          <Image src={PlusIcon} alt="" />
        </span>
      </div>
      <span className="absolute left-[-14px] top-[-0.98px] flex h-[18.5px] items-center justify-center rounded-full bg-brand-black px-[6.25px] text-[9.993px] font-extrabold leading-[1.27] tracking-brand text-white">
        +2000
      </span>
    </div>
    <div className="absolute left-[125.92px] top-[6.5px] flex h-[54.799px] w-[51.948px] items-center justify-center">
      <div className="relative h-[51.209px] w-[48.107px] rotate-[-4.47deg]">
        <Image
          src={CurveShape}
          alt=""
          className="absolute inset-[-13.66%_-14.54%] max-w-none"
        />
      </div>
    </div>
    {curveLetters.map((letter) => (
      <span
        key={letter.char}
        className="absolute flex -translate-y-1/2 items-center justify-center"
        style={{
          left: letter.left,
          top: letter.top,
          width: letter.width,
          height: letter.height,
        }}
      >
        <span
          className="text-[18.213px] font-extrabold leading-none text-brand-black"
          style={{ transform: `rotate(${letter.rotate}deg)` }}
        >
          {letter.char}
        </span>
      </span>
    ))}
    <div className="absolute left-[131px] top-[76px] size-[27px]">
      <Image
        src={PointerIcon}
        alt=""
        className="absolute inset-[-60.9%_-57.94%_-72.02%_-60.91%] max-w-none"
      />
    </div>
  </div>
);

type TThumb = {
  image: StaticImageData;
  left: number;
  top: number;
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  rotate: number;
};

const thumbs: TThumb[] = [
  {
    image: Thumb1,
    left: 5.46,
    top: 22.77,
    width: 60.859,
    height: 68.99,
    innerWidth: 51.983,
    innerHeight: 61.73,
    rotate: 8.85,
  },
  {
    image: Thumb2,
    left: 32.65,
    top: 29.15,
    width: 67.462,
    height: 75.794,
    innerWidth: 55.961,
    innerHeight: 66.454,
    rotate: -10.84,
  },
  {
    image: Thumb3,
    left: 58.3,
    top: 24.48,
    width: 67.738,
    height: 76.007,
    innerWidth: 55.961,
    innerHeight: 66.454,
    rotate: 11.13,
  },
  {
    image: Thumb4,
    left: 93.27,
    top: 24.48,
    width: 64.582,
    height: 73.529,
    innerWidth: 55.961,
    innerHeight: 66.454,
    rotate: -7.92,
  },
];

const LessonsFolder = () => (
  <div className="relative h-[112px] w-[159.72px]">
    <div className="absolute left-0 top-0 h-[111.922px] w-[159.719px]">
      <Image
        src={FolderShape}
        alt=""
        className="absolute inset-[-63.68%_-45.99%_-67.57%_-45.99%] max-w-none"
      />
    </div>
    {thumbs.map((thumb, index) => (
      <div
        key={index}
        className="absolute flex items-center justify-center"
        style={{
          left: thumb.left,
          top: thumb.top,
          width: thumb.width,
          height: thumb.height,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[6.995px] border-[2.332px] border-white"
          style={{
            width: thumb.innerWidth,
            height: thumb.innerHeight,
            transform: `rotate(${thumb.rotate}deg)`,
          }}
        >
          <Image
            src={thumb.image}
            alt=""
            fill
            sizes="60px"
            className="object-cover"
          />
        </div>
      </div>
    ))}
    <div className="absolute left-0 top-[55.41px] h-[56.5px] w-[159.722px] rounded-b-[20.985px] border-t-[1.087px] border-white bg-white/95 shadow-[inset_4.663px_0px_7.695px_0px_rgba(0,0,0,0.02),inset_-4.663px_0px_4.663px_0px_rgba(0,0,0,0.01)] backdrop-blur-[7.823px]" />
    <p className="absolute left-[79.32px] top-[80.4px] w-[102.135px] -translate-x-1/2 text-center text-xs font-bold leading-4 tracking-brand text-[rgba(17,24,28,0.88)]">
      <T k="hero.lessonsFrom" />{" "}
      <span className="text-brand-violet">2easy</span>
    </p>
    <div className="absolute left-[80.21px] top-[44.5px] flex h-[31.409px] w-[60.458px] -translate-x-1/2 items-center justify-center">
      <p className="rotate-[-6.5deg] whitespace-nowrap text-[23.156px] font-extrabold leading-[1.1] tracking-brand text-[rgba(17,24,28,0.88)] [text-shadow:0px_2.98px_12.665px_rgba(0,0,0,0.15)]">
        200+
      </p>
    </div>
  </div>
);

export const HeroDecor = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden select-none md:block"
      aria-hidden
    >
      <div
        className={`${itemClassName} left-[calc(50%-357.6px)] top-[53px] lg:left-[calc(50%-484px)] lg:top-[75px] wide:left-[calc(50%-544px)] wide:top-[48.85px]`}
      >
        <LessonsFolder />
      </div>
      <div
        className={`${itemClassName} left-[calc(50%-384px)] top-[203.9px] lg:left-[calc(50%-675px)] lg:top-[220px] wide:left-[calc(50%-763px)] wide:top-[214.85px]`}
      >
        <FloatCard
          title="GET INKED"
          tag="B1-B2"
          tagClassName="bg-[#a9f2ee] text-brand-black"
        >
          <div className="relative aspect-[301/318] w-full overflow-hidden rounded-2xl">
            <Image
              src={FloatInked}
              alt=""
              fill
              sizes="144px"
              className="object-cover"
            />
          </div>
        </FloatCard>
      </div>
      <div
        className={`${itemClassName} left-[calc(50%+291.3px)] top-[63px] lg:left-[calc(50%+519px)] lg:top-[75px] wide:left-[calc(50%+606.5px)] wide:top-[48.85px]`}
      >
        <FloatCard
          title="IS SOCIAL MEDIA FAKE?"
          tag="B2-C1"
          tagClassName="bg-brand-orange text-white"
        >
          <div className="relative h-[153.293px] w-[135.09px] overflow-hidden rounded-2xl">
            <Image
              src={FloatFake}
              alt=""
              sizes="137px"
              className="absolute left-[-1.35%] top-[-1.58%] h-[102.22%] w-[101.35%] max-w-none"
            />
          </div>
        </FloatCard>
      </div>
      <div
        className={`${itemClassName} left-[calc(50%+248.6px)] top-[264.2px] lg:left-[calc(50%+359px)] lg:top-[337px] wide:left-[calc(50%+423px)] wide:top-[349.85px]`}
      >
        <TeachersBadge />
      </div>
    </div>
  );
};
