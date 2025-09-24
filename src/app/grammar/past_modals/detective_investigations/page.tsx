"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data } from "./data";

export default function GrammarPage() {
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState("1");
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
            <BreadcrumbItem href="/grammar/past_modals">
              Past modals
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/detective_investigations">
              Detective investigations
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Detective investigations"}
            content={
              <>
                <br />
                <div>
                  Students look at the scenarios below and try to guess what
                  happened using past modals
                  <br />
                  <ul>
                    <li data-list="bullet">Examples:</li>
                    <li data-list="bullet">
                      “Some children must have done it, didn’t they?”
                    </li>
                    <li data-list="bullet">
                      “The robberies could have broken in, couldn’t they?”
                    </li>
                  </ul>
                  <br />
                  After guessing, they can check the answers
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
          onSelectionChange={setTabIndex}
          className="w-full wrap flex-wrap flex"
          fullWidth
          classNames={{
            tabList: "flex flex-wrap wrap justify-between",
            tab: "w-[100%] lg:w-[9%]",
          }}
        >
          {data.map((tab) => {
            return <Tab key={tab.id.toString()} title={tab.id.toString()} />;
          })}
        </Tabs>
        <div className="h-10" />
        <div className="h-10" />
        <div className="min-h-[694px]">
          {data.map((d) => {
            if (d.id.toString() !== tabIndex) {
              return;
            }
            return (
              <div key={d.id}>
                <SquareList data={[d]} squareWidth={"33.33333%"} isCarousel />
                <div className="h-10" />
                <div className="h-10" />
                <SquareList
                  data={[d]}
                  squareWidth={"100%"}
                  isGallery
                  withToggle
                  toggleLabel={["SHOW THE ANSWER", "HIDE THE ANSWER"]}
                />
                <div className="h-10" />
              </div>
            );
          })}
        </div>
      </ContentWrapper>
    </main>
  );
}
