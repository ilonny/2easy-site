/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { CheckboxList } from "@/components/CheckboxList";
import { data, data1, data2, summerData } from "./data";
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
            <BreadcrumbItem href="/speaking_games/would_you_rather">
              Would you rather
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={'"Would you rather?"'}
            content={
              <>
                <br />
                <h2>
                  The game features thought-provoking questions, such as “Would
                  you rather eat and not gain weight or always eat for free?” It
                  aims to practice the construction "I'd rather" and stimulate
                  engaging discussions. It is suitable for B1 level students and
                  above.
                </h2>
                <br />
                Players take turns reading out “Would you rather” questions,
                other students choose one option and explain their reasoning. If
                playing with an individual student, ask follow-up questions to
                elicit more details about their choice.
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
        <SquareList data={tabIndex === "all" ? data : summerData} isCarousel />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={tabIndex === "all" ? data : summerData}
          // squareWidth={"33.33333%"}
          isGallery
          withToggle
        />
      </ContentWrapper>
    </main>
  );
}
