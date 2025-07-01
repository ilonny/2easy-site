"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { data, shuffledData, tabs } from "./data";
import { PageLeftBlock } from "@/components/PageLeftBlock";

export default function GrammarPage() {
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  useEffect(() => {
    if (!checkSubscription()) {
      router.push("/subscription");
    }
  }, [checkSubscription, router]);

  const [selectedTabKey, setSelectedTabKey] = useState(tabs[0].key);

  const dataToRender = useMemo(() => {
    if (selectedTabKey === "1") {
      return shuffledData;
    }
    const category = tabs.find((t) => t.id.toString() === selectedTabKey)?.key;

    return data.filter((d) => d.category === category);
  }, [selectedTabKey]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/discussion_cards">
              Discussion cards
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Discussion cards"}
            content={
              <>
                <br />
                <h2>
                  More than a 140 non-trivial questions on various life topics -
                  from food to feminism and business. The discussion cards are
                  designed to improve discussion skills, stimulate critical
                  thinking and encourage conversation in English.
                  <br />
                  <br />
                  These cards are suitable for both individual and group classes
                  with students at B1 level and above.
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
          selectedKey={selectedTabKey}
          onSelectionChange={setSelectedTabKey}
          // className="w-full wrap flex-wrap flex"
          fullWidth
          classNames={{
            tabList: "flex flex-wrap wrap justify-center",
            tab: "max-w-[19%]",
          }}
        >
          {tabs.map((tab) => {
            return <Tab key={tab.id} title={tab.label} />;
          })}
        </Tabs>
        <div className="h-10" />
        <SquareList
          data={dataToRender}
          isCarousel
          hideDots={selectedTabKey === "1"}
        />
        <div className="h-10" />
        <SquareList
          data={dataToRender}
          isGallery
          withToggle
          squareHeight="250px"
        />
      </ContentWrapper>
    </main>
  );
}
