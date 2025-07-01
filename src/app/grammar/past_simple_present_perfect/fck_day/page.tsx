/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
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
import { data, studentA, studentB } from "./data";
import { GalleryList } from "@/components/GalleryList";
import FImage from "@/assets/images/grammar/main_blocks/fck_day.gif";

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
            <BreadcrumbItem href="/grammar/past_simple_present_perfect">
              Past Simple & Present Perfect
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_simple_present_perfect/fck_day">
              F#ck day
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"F#CK DAY!"}
            content={
              <>
                <br />
                <div>
                  One player starts by saying something they have done recently
                  in the Present Perfect tense.
                  <br />
                  <br />
                  <strong>Example:</strong>
                  <br />
                  <ul>
                    <li data-list="bullet">
                      Player 1 (Present Perfect): “I’ve had the worst day ever!”
                    </li>
                  </ul>
                  <br /> The other player continues by describing a specific
                  event that happened to make the day worse, using Past Simple.
                  <br />
                  <br />
                  <strong>Example:</strong>
                  <br />
                  <ul>
                    <li data-list="bullet">
                      Player 2 (Past Simple): “I spilled coffee on my favorite
                      shirt this morning.”
                    </li>
                  </ul>
                  <br />
                  Players keep alternating, adding Present Perfect and Past
                  Simple sentences to make the day even worse. They should get
                  creative and silly with the situations:
                  <br />
                  <br />– (Present Perfect): “I’ve been late to every meeting
                  today.”
                  <br />– (Past Simple): “I missed the bus because I was looking
                  for my other shoe.”
                  <br />
                  <br />
                  <strong>
                    {" "}
                    The crazier and more exaggerated the situations, the better!
                    The goal is to make the worst day ever into a funny, absurd
                    story.
                  </strong>
                </div>
              </>
            }
          />
          <img src={FImage.src} style={{ width: 400 }} />
        </div>
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
