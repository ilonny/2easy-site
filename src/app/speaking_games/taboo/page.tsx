"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data, dataA1, dataB1, dataSlang } from "./data";
import Link from "next/link";

export default function GrammarPage() {
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  useEffect(() => {
    if (!checkSubscription()) {
      router.push("/subscription");
    }
  }, [checkSubscription, router]);

  const [tabIndex, setTabIndex] = useState("A1");

  const dataToRender = useMemo(() => {
    if (tabIndex === "A1") {
      return dataA1;
    }
    if (tabIndex === "B1") {
      return dataB1;
    }
    if (tabIndex === "SLANG") {
      return dataSlang;
    }
    return dataA1;
  }, [tabIndex]);

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
            <BreadcrumbItem href="/speaking_games/taboo">Taboo</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Taboo"}
            content={
              <>
                <br />
                <h2>
                  Taboo is an exciting word-guessing game that challenges
                  players to describe a word without using certain related
                  words, known as "taboo" words and encourages creativity and
                  quick thinking.
                  <br />
                  <br /> One player draws a card with a target word at the top
                  and a list of taboo words below it. The player has a limited
                  time (usually one minute) to describe the target word to their
                  teammates without using any of the taboo words listed on the
                  card. <br />
                  <br />
                  Teammates try to guess the target word based on the
                  description given. If the team guesses correctly, they earn a
                  point. If the player accidentally uses a taboo word or the
                  timer runs out, the turn ends, and no points are awarded. The
                  game continues until all cards are used or a set time limit is
                  reached. The team with the most points wins!
                  <br />
                  <br />
                  <p>Links for the students:</p>
                  <Link
                    href="/taboo_a1_a2"
                    target="_blank"
                    style={{ color: "#3f28c6" }}
                    className="underline hover:decoration-0"
                  >
                    A1 – A2
                  </Link>
                  <br />
                  <Link
                    href="/taboo_b1_b2"
                    target="_blank"
                    style={{ color: "#3f28c6" }}
                    className="underline hover:decoration-0"
                  >
                    B1 – B2
                  </Link>
                  <br />
                  <Link
                    href="/taboo_b1_b2_slang"
                    target="_blank"
                    style={{ color: "#3f28c6" }}
                    className="underline hover:decoration-0"
                  >
                    B1 – B2, slang
                  </Link>
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <Tabs
          color="primary"
          size="lg"
          aria-label="Tabs"
          radius={"none"}
          selectedKey={tabIndex}
          onSelectionChange={(val) => setTabIndex(val)}
          fullWidth
          classNames={{
            tabList: "flex flex-wrap wrap justify-between max-w-[500px] m-auto",
            tab: "w-[100%] lg:w-[32%]",
          }}
        >
          <Tab key={"A1"} title={"A1 - A2"} />
          <Tab key={"B1"} title={"B1 - B2"} />
          <Tab key={"SLANG"} title={"B1 - B2, slang"} />
        </Tabs>
        <div className="h-10" />
        <SquareList data={dataToRender} squareWidth={"33.33333%"} isCarousel />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={dataToRender}
          squareWidth={"33.33333%"}
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
