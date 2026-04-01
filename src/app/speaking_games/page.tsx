/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { data } from "./data";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function GrammarPage() {
  const { t } = useTranslation();
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-8 md:h-10 lg:h-14" />
          <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch] pb-0.5">
            <Breadcrumbs>
            <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
            <BreadcrumbItem href="/speaking_games">
              {t("header.speakingGames")}
            </BreadcrumbItem>
          </Breadcrumbs>
          </div>
        </div>
        <div className="h-6 md:h-8 lg:h-10" />
        <div className="h-6 md:h-8 lg:h-10" />
        <h1 className="text-center text-[#3f28c6] font-bold text-[26px] leading-tight px-2 sm:text-[32px] md:text-[38px] lg:text-[44px]">
          SPEAKING GAMES
        </h1>
        <p
          className="max-w-[675px] text-center m-auto px-3 text-base sm:text-lg md:text-xl font-medium leading-relaxed"
        >
          Games that are great for warm-ups and any part of the lesson: these
          activities help energize students before class and lift their mood
        </p>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-start flex-wrap wrap">
          {data.map((el) => {
            return (
              <Link
                className="w-full md:w-1/2 lg:w-[33.33333%] p-2 mb-4"
                key={el.id}
                href={el.link}
              >
                <div>
                  <img src={el.img.src} className="w-full h-auto rounded-t-lg" alt="" />
                  <div
                    className="mt-4 p-4 bg-white"
                    style={{ borderRadius: 12 }}
                  >
                    <p
                      className="uppercase mb-2"
                      style={{
                        fontSize: 18,
                        color: "#5837dc",
                        fontWeight: 700,
                      }}
                    >
                      {el.title}
                    </p>
                    <p>{el.text}</p>
                    <div className="flex justify-end mt-2">
                      <span style={{ color: "#5837dc" }}>Open</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ContentWrapper>
    </main>
  );
}
