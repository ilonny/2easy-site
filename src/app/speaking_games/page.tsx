/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { data } from "./data";
import Link from "next/link";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/speaking_games">
              Speaking games
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          SPEAKING GAMES
        </h1>
        <p
          className="max-w-[675px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
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
                className="w-[100%] lg:w-[33.333333%] p-2 mb-4"
                key={el.id}
                href={el.link}
              >
                <div>
                  <img src={el.img.src} />
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
