/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Button } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { CheckboxList } from "@/components/CheckboxList";
import { data1, data2 } from "./data";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Superlatives1 from "@/assets/images/superlatives1.png";
import Superlatives2 from "@/assets/images/superlatives2.png";

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
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/superlatives">
              Superlatives
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/superlatives/good_to_know_it">
              Good to know it
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Good to know it"}
            content={
              <>
                <br />
                It is a superlative board game about cities and towns where
                students live.
                <br />
                <br />
                Students take turns rolling the dice and moving their counters
                along the board. When a student lands on a square, they make a
                superlative question about their town or city using the
                adjective in brackets and ask the question to other student(s).
                <br />
                <br />
                If everybody lives in one city, all students discuss the answers
                and try to reach an agreement. If they live in different cities,
                all students answer the question and give more details.
                <br />
                <br />
                The game ends when the first student reaches the finish.
              </>
            }
          />
        </div>
        <div className="h-10" />
      </ContentWrapper>
      <div className="h-[913px] bg-[#f9f9f9]">
        <iframe
          title="Board city game"
          frameborder="0"
          width="1366"
          height="675"
          style={{ margin: "auto" }}
          src="https://view.genially.com/66d05d4d3424344572703400"
          type="text/html"
          allowscriptaccess="always"
          allowfullscreen="true"
          scrolling="yes"
          allownetworking="all"
        ></iframe>
      </div>
    </main>
  );
}
