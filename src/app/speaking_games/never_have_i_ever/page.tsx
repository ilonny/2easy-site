"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data, summerData } from "./data";

export default function GrammarPage() {
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  useEffect(() => {
    if (!checkSubscription()) {
      router.push("/subscription");
    }
  }, [checkSubscription, router]);

  const [tabIndex, setTabIndex] = useState("all");

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
            <BreadcrumbItem href="/speaking_games/never_have_i_ever">
              Never have i ever
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Never have i ever"}
            content={
              <>
                <br />
                <h2>
                  This game is a perfect icebreaker for warm-ups and a wonderful
                  speaking exercise to practice Present Perfect and Past Simple.
                  <br />
                  <br />
                  There are 80 cards with different “Never Have I Ever”
                  statements, ranging from food experiences to romantic
                  encounters.
                  <br />
                  <br />
                  The game is suitable for group activities, speaking clubs, and
                  individual lessons.
                </h2>
                <div>
                  <br />
                  Players take turns reading out “Never have i ever” statements.
                  Other players must react to the statement heard. Everyone who
                  has ever had a similar experience shares their stories.
                </div>
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
            tab: "w-[100%] lg:w-[49%]",
          }}
        >
          <Tab key={"all"} title={"Basic"} />
          <Tab key={"summer"} title={"Summer edition"} />
        </Tabs>
        <div className="h-10"></div>
        <SquareList
          data={tabIndex === "all" ? data : summerData}
          squareWidth={"33.333333%"}
          isCarousel
          hideDots
        />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={tabIndex === "all" ? data : summerData}
          // squareWidth={"33.333333%"}
          isGallery
          withToggle
        />
      </ContentWrapper>
    </main>
  );
}
