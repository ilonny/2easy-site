"use client";
import Image, { StaticImageData } from "next/image";
import { KeyboardEvent, useEffect, useRef } from "react";
import { T } from "@/i18n/T";
import { useDragScroll } from "@/hooks/useDragScroll";
import { TContentTab } from "../useTabCards";
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
  tab: TContentTab;
  titleKey: string;
  images: [StaticImageData, StaticImageData, StaticImageData];
};

const categories: TCategory[] = [
  {
    tab: "lessons",
    titleKey: "content.catLessons",
    images: [Lessons1, Lessons2, Lessons3],
  },
  {
    tab: "courses",
    titleKey: "content.catCourses",
    images: [Courses1, Courses2, Courses3],
  },
  {
    tab: "speaking",
    titleKey: "content.catSpeaking",
    images: [Speaking1, Speaking2, Speaking3],
  },
  {
    tab: "discussion",
    titleKey: "content.catDiscussion",
    images: [Discussion1, Discussion2, Discussion3],
  },
  {
    tab: "grammar",
    titleKey: "content.catGrammar",
    images: [Grammar1, Grammar2, Grammar3],
  },
];

// Fanned stack of three cards inside a 116×82 box, back card first.
// On hover the stack spreads out further.
const stackCards = [
  "left-[51.2px] top-[5.5px] h-[61.84px] w-[59.68px] rotate-[11.7deg] group-hover:translate-x-[9px] group-hover:translate-y-[3px] group-hover:rotate-[15deg]",
  "left-[29.97px] top-[5.06px] h-[61.92px] w-[59.6px] rotate-[-4.1deg] group-hover:translate-x-[5px] group-hover:-translate-y-[12px] group-hover:rotate-[-1deg]",
  "left-[8.85px] top-[10.87px] h-[61.6px] w-[59.92px] rotate-[-22.88deg] group-hover:-translate-x-[3px] group-hover:translate-y-[2px] group-hover:rotate-[-25deg]",
];

type TProps = {
  active: TContentTab;
  onChange: (tab: TContentTab) => void;
  panelId: string;
};

export const ContentCategories = ({ active, onChange, panelId }: TProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isFirstRender = useRef(true);
  useDragScroll(listRef);

  // On narrow screens the row scrolls, so keep the selected tab centred in it.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const list = listRef.current;
    const tab = tabRefs.current[categories.findIndex((c) => c.tab === active)];
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollTo({
      left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [active]);

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    if (!(event.key in offsets)) return;
    event.preventDefault();
    const next =
      (index + offsets[event.key] + categories.length) % categories.length;
    onChange(categories[next].tab);
    tabRefs.current[next]?.focus();
  };

  return (
    // The vertical padding leaves room for the cards fanning out on hover inside the scroller;
    // the faded edges hint that the row continues.
    <div
      ref={listRef}
      role="tablist"
      className="-mx-5 -my-5 flex select-none gap-2.5 overflow-x-auto overscroll-x-contain px-5 py-5 [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)] [scrollbar-width:none] md:justify-center md:overflow-visible md:[mask-image:none] lg:gap-[30px] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((category, index) => {
        const selected = category.tab === active;
        return (
          <button
            key={category.tab}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(category.tab)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`group flex w-[100px] shrink-0 flex-col items-center gap-3 transition-opacity duration-300 lg:w-[120px] ${
              selected ? "cursor-default opacity-35" : ""
            }`}
          >
            <span className="relative h-[70px] w-[99px] lg:h-[82px] lg:w-[116px]">
              <span className="absolute left-0 top-0 h-[82px] w-[116px] origin-top-left scale-[0.853] lg:scale-100">
                {category.images.map((image, i) => (
                  <span
                    key={image.src}
                    className={`absolute overflow-hidden rounded-[9px] border-2 border-white shadow-[0_4px_18.1px_rgba(0,0,0,0.07)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${stackCards[i]}`}
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
          </button>
        );
      })}
    </div>
  );
};
