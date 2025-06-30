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
import { studentA, studentB } from "./data";
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
            <BreadcrumbItem href="/grammar/comparatives">
              Comparatives
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/comparatives/comparative_clues">
              Comparative clues
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Comparative clues"}
            content={
              <>
                <br />
                <>
                  <h2>
                    Give your partner three clues to help them guess the name,
                    word or phrase in bold at the top of each box.
                    <br />
                    <br />
                    Substitute the words in bold for a pronoun and use
                    comparative forms for the clues, e.g.{" "}
                    <strong>'He is younger than Tom Hanks'</strong>. Your
                    partner tries to guess who or what is being described
                  </h2>
                  <br />
                  <Link
                    href="/comparative_cards_a"
                    target="_blank"
                    className="text-primary underline"
                  >
                    Cards for student A
                  </Link>
                  <br />
                  <Link
                    target="_blank"
                    href="/comparative_cards_b"
                    className="text-primary underline"
                  >
                    Cards for student B
                  </Link>
                </>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="max-w-[400px] m-auto">
          <Accordion variant="splitted">
            <AccordionItem
              key="1"
              aria-label="Accordion 1"
              title="Open teacher's notes"
            >
              Ask your students create 3 more words and clues for them. Play
              together
            </AccordionItem>
          </Accordion>
        </div>
        <div className="h-10" />
        <SquareList
          data={studentA}
          squareWidth={"33.333333%"}
          squareHeight={"250px"}
          isGallery
        />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={studentB}
          squareWidth={"33.333333%"}
          squareHeight={"250px"}
          isGallery
        />
      </ContentWrapper>
    </main>
  );
}
