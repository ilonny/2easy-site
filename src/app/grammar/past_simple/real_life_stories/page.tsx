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
import { data, data1, data2 } from "./data";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

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
            <BreadcrumbItem href="/grammar/past_simple">
              Past Simple
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_simple/real_life_stories">
              Real life stories
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Real life stories"}
            content={
              <>
                <br />
                <h2>
                  There are 10 hooked story beginnings written in the past
                  tense. Students must create a continuation for each beginning
                  using the past simple tense. Encourage them to create at least
                  3 sentences, making them as crazy and funny as possible!
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList data={data} isCarousel />
        <div className="h-10" />
        <SquareList data={data} isGallery withToggle squareHeight="250px"  squareWidth="33.33333%"/>
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
