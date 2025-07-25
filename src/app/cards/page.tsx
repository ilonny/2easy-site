/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { ProfileLessons } from "../lessons/components/ProfileLessons";
import { data } from "./data";
import Link from "next/link";

export default function GrammarPage() {
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  useEffect(() => {
    if (!checkSubscription()) {
      router.push("/subscription");
    }
  }, [checkSubscription, router]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/discussion_cards">
              Discussion cards
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
          DISCUSSION CARDS
        </h1>
        <p
          className="max-w-[675px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
        >
          Non-trivial questions on topical issues include psychology,
          technology, work and business, relationships, and many others
        </p>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-start flex-wrap wrap">
          {data.map((el) => {
            return (
              <div className="w-[33.333333%] p-2 mb-4" key={el.id}>
                <img src={el.img.src} />
                <div className="mt-4 p-4 bg-white" style={{ borderRadius: 12 }}>
                  <p
                    className="uppercase mb-2"
                    style={{ fontSize: 18, color: "#5837dc", fontWeight: 700 }}
                  >
                    {el.title}
                  </p>
                  <p>{el.text}</p>
                  <div className="flex justify-end mt-2">
                    <Link href={el.link} style={{ color: "#5837dc" }}>
                      Open
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ContentWrapper>
    </main>
  );
}
