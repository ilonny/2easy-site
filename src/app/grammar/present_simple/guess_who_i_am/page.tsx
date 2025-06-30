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
            <BreadcrumbItem href="/grammar/present_simple">
              Present Simple
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/present_simple/guess_who_i_am">
              Guess who i am
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Guess who i am"}
            content={
              <>
                <br />
                <>
                  <h2>
                    Each student will receive a card with the name of a famous
                    person on it. However, they must keep their card a secret
                    from the others. The goal of the game is to guess who your
                    partner’s famous person is by asking yes/no questions in the
                    Present Simple tense.
                    <br />
                    <br />
                    <strong>Example </strong>
                    <br />
                    Are you a woman?
                    <br />
                    -Yes
                    <br />
                    Do you live in Russia?
                    <br />
                    -No
                    <br />
                    <br />
                    If the student says no, the turn passes to the next person.
                  </h2>
                  <br />
                  <Link
                    href="/guess_who_i_am_a"
                    target="_blank"
                    className="text-primary underline"
                  >
                    Cards for student A
                  </Link>
                  <br />
                  <Link
                    target="_blank"
                    href="/guess_who_i_am_b"
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
              <div>
                To get more ideas for people's names,
                <br />
                <a
                  href="https://www.funktionevents.co.uk/groups/blog/who-am-i-game-groups"
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    color: "rgb(23, 113, 241)",
                    textDecoration: "underline",
                  }}
                >
                  follow the link
                </a>
              </div>
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
