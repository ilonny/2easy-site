"use client";

import { useState } from "react";
import { T } from "@/i18n/T";
import { landingContainerClassName } from "@/constants/layout";

const questions = ["card", "autoCharge", "limits", "included", "help"];

export const MainFaq = () => {
  const [opened, setOpened] = useState<string | null>("autoCharge");

  return (
    <section
      className={`${landingContainerClassName} flex flex-col items-center gap-[30px] lg:gap-[50px]`}
    >
      <h2 className="text-center text-[25px] font-bold leading-none tracking-brand text-brand-black lg:text-[40px]">
        <T k="faq.title" />
      </h2>
      <div className="flex w-full max-w-[650px] flex-col gap-2.5">
        {questions.map((id) => {
          const isOpen = opened === id;
          return (
            <button
              key={id}
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpened(isOpen ? null : id)}
              className="flex w-full items-start gap-5 rounded-xl bg-brand-gray p-[15px] text-left font-bold text-brand-black lg:gap-[50px] lg:rounded-2xl lg:px-8 lg:py-5"
            >
              <span className="flex min-h-[30px] flex-1 flex-col justify-center lg:min-h-10">
                <T
                  k={`faq.${id}Q`}
                  className="text-sm leading-[1.3] tracking-brand lg:text-base lg:leading-[1.35] lg:tracking-normal"
                />
                <span
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <span className="overflow-hidden">
                    <T
                      k={`faq.${id}A`}
                      className="block pt-[15px] text-sm leading-[1.3] tracking-brand text-brand-grayFont lg:text-base lg:leading-[1.3]"
                    />
                  </span>
                </span>
              </span>
              <span
                className={`flex size-[30px] shrink-0 items-center justify-center rounded-lg transition-colors lg:size-10 lg:rounded-[10px] ${
                  isOpen ? "bg-brand-violet text-white" : "bg-white text-brand-black"
                }`}
                aria-hidden
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`size-3 transition-transform duration-300 lg:size-4 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <path
                    d="M8 1v14M1 8h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
