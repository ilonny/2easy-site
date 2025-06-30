"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
} from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import Link from "next/link";
import { data } from "./data";
import { GalleryList } from "@/components/GalleryList";

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
            <BreadcrumbItem href="/grammar/future_simple">
              Future Simple
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/future_simple/future_news_reporters">
              Future news reporters
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Future news reporters"}
            content={
              <>
                <br />
                <h2>
                  Practice the future simple tense by predicting future events
                  and
                  <br />
                  presenting them like a news reporter.
                  <br />
                  <br />
                  There are some futuristic scenarios.
                  <br />
                  The student or the students must{" "}
                  <strong>use Future Simple tense</strong> to make predictions
                  and explain the event, e.g., "In the year 2050, people will
                  live on Mars," or "In 10 years, everyone will travel to work
                  by flying cars".
                  <br />
                  <br />
                  Give the students 5-10 minutes to prepare their news report.
                  They should choose <strong>a newsreader</strong> to present
                  the main news.
                  <br />
                  <br />
                  After each report, the teacher or other students can ask{" "}
                  <strong>follow-up questions</strong> in the Future Simple
                  tense. For example:
                  <br /> - "When will flying cars be available to the public?"
                  <br /> - "Who will be the first person to live on Mars?"
                  <br />- "What will the new species of animal look like?"
                  <br />- "How often will people travel to the Moon?"
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h2 style={{ fontStyle: "italic", fontSize: 22, textAlign: "center" }}>
          <em>Futuristic</em> scenarios
        </h2>
        <div className="h-5" />
        <SquareList data={data} isCarousel />
        <div className="h-10" />
        <SquareList data={data} isGallery withToggle squareWidth="33.33333%" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
