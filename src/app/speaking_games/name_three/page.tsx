"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data, dataA1, dataB1 } from "./data";

export default function GrammarPage() {
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  useEffect(() => {
    if (!checkSubscription()) {
      router.push("/subscription");
    }
  }, [checkSubscription, router]);

  const [tabIndex, setTabIndex] = useState("A1");

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
            <BreadcrumbItem href="/speaking_games/name_three">
              Name three
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Name three"}
            content={
              <>
                <br />
                <h2>
                  This game encourages students to quickly apply their skills by
                  naming three things related to the topic on the card. It
                  develops their ability to think quickly in English and boosts
                  vocabulary.
                  <br />
                  <br />
                  The point of the game is to name three things related to the
                  topic on the card within a limited amount of time. The time
                  allowed depends on the student's level, but we recommend
                  giving no more than 7 seconds for each card.
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
            tab: "w-[100%] lg:w-[49%]",
          }}
        >
          <Tab key={"A1"} title={"A1 - A2"} />
          <Tab key={"B1"} title={"B1 - B2"} />
        </Tabs>
        <div className="h-10"></div>
        <SquareList
          data={tabIndex === "A1" ? dataA1 : dataB1}
          squareWidth={"33.333333%"}
          isCarousel
        />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={tabIndex === "A1" ? dataA1 : dataB1}
          squareWidth={"33.333333%"}
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
