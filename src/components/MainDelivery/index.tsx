import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import { landingContainerClassName } from "@/constants/layout";
import { SectionHeading } from "@/components/SectionHeading";
import GraphIcon from "@/assets/icons/graph_violet.svg";
import Dictionary from "@/assets/images/delivery/dictionary.jpg";
import Board from "@/assets/images/delivery/board.jpg";
import Services from "@/assets/images/delivery/services.jpg";
import VideoCall from "@/assets/images/delivery/video.jpg";
import Chat from "@/assets/images/delivery/chat.jpg";

type TFeature = {
  titleKey: string;
  image: StaticImageData;
  /** Looping clip shown over the image once the designers hand it over. */
  video?: string;
};

const features: TFeature[] = [
  { titleKey: "delivery.dictionary", image: Dictionary },
  { titleKey: "delivery.board", image: Board },
  { titleKey: "delivery.services", image: Services },
  { titleKey: "delivery.videoCall", image: VideoCall },
  { titleKey: "delivery.chat", image: Chat },
];

export const MainDelivery = () => {
  return (
    <section
      className={`${landingContainerClassName} flex flex-col gap-[30px] lg:gap-[50px]`}
    >
      <SectionHeading
        icon={
          <Image
            src={GraphIcon}
            alt=""
            className="absolute left-px top-[1.5px]"
          />
        }
        labelKey="delivery.label"
        titleKey="delivery.title"
        className="gap-[18px]"
      />
      <div className="flex flex-col gap-5 md:-mx-5 md:snap-x md:snap-mandatory md:scroll-pl-5 md:flex-row md:gap-[15px] md:overflow-x-auto md:px-5 md:[scrollbar-width:none] lg:-mx-[65px] lg:scroll-pl-[65px] lg:gap-5 lg:px-[65px] md:[&::-webkit-scrollbar]:hidden">
        {features.map((feature) => (
          <div
            key={feature.titleKey}
            className="relative h-[370px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-brand-gray p-[30px] md:h-[410px] md:w-[380px] lg:h-[470px] lg:w-[424px] lg:rounded-[30px] lg:p-10"
          >
            <Image
              src={feature.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 424px, (min-width: 768px) 380px, 100vw"
              className="pointer-events-none object-cover"
            />
            {feature.video && (
              <video
                src={feature.video}
                poster={feature.image.src}
                autoPlay
                muted
                loop
                playsInline
                className="pointer-events-none absolute inset-0 size-full object-cover"
              />
            )}
            <T
              k={feature.titleKey}
              as="p"
              className="relative text-center text-base font-bold leading-[1.2] tracking-brand text-brand-black lg:text-left lg:text-[22px] lg:leading-[1.2]"
            />
          </div>
        ))}
        <div className="hidden w-0 shrink-0 md:block lg:w-[45px]" aria-hidden />
      </div>
    </section>
  );
};
