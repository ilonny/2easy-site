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
import SnapShotImg from "@/assets/images/grammar/main_blocks/the_mystery_snapshot.jpg";

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
            <BreadcrumbItem href="/grammar/past_continuous">
              Past Continuous
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_continuous/the_mystery_snapshot">
              The mystery snapshot
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"The mystery snapshot"}
            content={
              <>
                <br />
                <h2>
                  Students will be creating a story based on a picture, focusing
                  on what people were doing at a specific moment in the past
                  using the past continuous tense. Students will
                  <strong> take turns describing </strong>what they think
                  <strong> was happening </strong>in the picture at that moment
                  using the past continuous.
                  <br />
                  <br />
                  For example:
                  <br />
                  "He<strong> was slipping </strong>on a banana peel and
                  <strong> trying </strong>to keep his balance."
                </h2>
                <br />
                <img src={SnapShotImg.src} />
                <br />
                <h2>
                  After each description, a teacher can ask follow-up questions
                  to get more information and encourage
                  <strong> further use of the past continuous tense:</strong>
                  <br />- "What was the person wearing when they were doing
                  that?"
                  <br />- "Who else was with them at that moment?"
                  <br />- "What were they planning to do next?"
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <h2 style={{ fontStyle: "italic", fontSize: 22, textAlign: "center" }}>
          <em>Pictures:</em>
        </h2>
        <div className="h-5" />
        <SquareList data={data} isCarousel />
        <div className="h-10" />
        <SquareList data={data} isGallery withToggle />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
