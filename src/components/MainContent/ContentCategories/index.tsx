"use client";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { T } from "@/i18n/T";
import { writeToLocalStorage } from "@/auth/utils";
import Lessons1 from "@/assets/images/content/cat_lessons_1.jpg";
import Lessons2 from "@/assets/images/content/cat_lessons_2.jpg";
import Lessons3 from "@/assets/images/content/cat_lessons_3.jpg";
import Courses1 from "@/assets/images/content/cat_courses_1.jpg";
import Courses2 from "@/assets/images/content/cat_courses_2.jpg";
import Courses3 from "@/assets/images/content/cat_courses_3.jpg";
import Speaking1 from "@/assets/images/content/cat_speaking_1.jpg";
import Speaking2 from "@/assets/images/content/cat_speaking_2.jpg";
import Speaking3 from "@/assets/images/content/cat_speaking_3.jpg";
import Discussion1 from "@/assets/images/content/cat_discussion_1.jpg";
import Discussion2 from "@/assets/images/content/cat_discussion_2.jpg";
import Discussion3 from "@/assets/images/content/cat_discussion_3.jpg";
import Grammar1 from "@/assets/images/content/cat_grammar_1.jpg";
import Grammar2 from "@/assets/images/content/cat_grammar_2.jpg";
import Grammar3 from "@/assets/images/content/cat_grammar_3.jpg";

type TCategory = {
  titleKey: string;
  href: string;
  lessonsTab?: string;
  images: [StaticImageData, StaticImageData, StaticImageData];
};

const categories: TCategory[] = [
  {
    titleKey: "content.catLessons",
    href: "/lesson_plans",
    images: [Lessons1, Lessons2, Lessons3],
  },
  {
    titleKey: "content.catCourses",
    href: "/lesson_plans",
    lessonsTab: "2easyCourses",
    images: [Courses1, Courses2, Courses3],
  },
  {
    titleKey: "content.catSpeaking",
    href: "/speaking_games",
    images: [Speaking1, Speaking2, Speaking3],
  },
  {
    titleKey: "content.catDiscussion",
    href: "/cards",
    images: [Discussion1, Discussion2, Discussion3],
  },
  {
    titleKey: "content.catGrammar",
    href: "/grammar",
    images: [Grammar1, Grammar2, Grammar3],
  },
];

// Fanned stack of three cards inside a 116×82 box, back card first.
const stackCards = [
  "left-[51.2px] top-[5.5px] h-[61.84px] w-[59.68px] rotate-[11.7deg]",
  "left-[29.97px] top-[5.06px] h-[61.92px] w-[59.6px] rotate-[-4.1deg]",
  "left-[8.85px] top-[10.87px] h-[61.6px] w-[59.92px] rotate-[-22.88deg]",
];

export const ContentCategories = () => {
  return (
    <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 [scrollbar-width:none] md:justify-center lg:gap-[30px] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <Link
          key={category.titleKey}
          href={category.href}
          onClick={() => {
            if (category.lessonsTab) {
              writeToLocalStorage("saved_lessons_tab", category.lessonsTab);
            }
          }}
          className="flex w-[100px] shrink-0 flex-col items-center gap-3 transition-opacity hover:opacity-35 lg:w-[120px]"
        >
          <span className="relative h-[70px] w-[99px] lg:h-[82px] lg:w-[116px]">
            <span className="absolute left-0 top-0 h-[82px] w-[116px] origin-top-left scale-[0.853] lg:scale-100">
              {category.images.map((image, i) => (
                <span
                  key={image.src}
                  className={`absolute overflow-hidden rounded-[9px] border-2 border-white shadow-[0_4px_18.1px_rgba(0,0,0,0.07)] ${stackCards[i]}`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                </span>
              ))}
            </span>
          </span>
          <T
            k={category.titleKey}
            className="whitespace-nowrap text-center text-xs font-bold tracking-brand text-brand-black lg:text-sm"
          />
        </Link>
      ))}
    </div>
  );
};
