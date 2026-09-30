import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import { landingContainerClassName } from "@/constants/layout";
import { SectionHeading } from "@/components/SectionHeading";
import EditIcon from "@/assets/icons/edit_violet.svg";
import Builder from "@/assets/images/prep/builder.jpg";
import ReadyLessons from "@/assets/images/prep/ready_lessons.jpg";
import Share from "@/assets/images/prep/share.jpg";
import Ai from "@/assets/images/prep/ai.jpg";

type TFeature = {
  titleKey: string;
  image: StaticImageData;
  /** Looping clip shown over the image once the designers hand it over. */
  video?: string;
};

const features: TFeature[] = [
  { titleKey: "prep.builder", image: Builder },
  { titleKey: "prep.readyLessons", image: ReadyLessons },
  { titleKey: "prep.share", image: Share },
  { titleKey: "prep.ai", image: Ai },
];

export const MainPrep = () => {
  return (
    <section
      className={`${landingContainerClassName} flex flex-col items-center gap-[30px] lg:gap-[170px] lg:pt-[100px]`}
    >
      <SectionHeading
        icon={
          <Image src={EditIcon} alt="" className="absolute left-0.5 top-0.5" />
        }
        labelKey="prep.label"
        titleKey="prep.title"
        className="gap-5 lg:gap-[30px]"
      />
      <div className="grid w-full grid-cols-1 gap-2.5 md:grid-cols-[repeat(2,minmax(0,380px))] md:justify-center md:gap-[15px] lg:grid-cols-[570px] lg:gap-[30px]">
        {features.map((feature) => (
          <div
            key={feature.titleKey}
            className="relative flex aspect-square flex-col items-center overflow-hidden rounded-[20px] bg-brand-gray px-[25px] pb-[15px] pt-[25px] lg:aspect-auto lg:h-[560px] lg:rounded-[30px] lg:px-[95px] lg:pb-10 lg:pt-[50px]"
          >
            <Image
              src={feature.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 570px, (min-width: 768px) 380px, 100vw"
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
              className="relative w-full text-center text-base font-bold leading-[1.2] tracking-brand text-brand-black lg:text-[22px] lg:leading-[1.2]"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
