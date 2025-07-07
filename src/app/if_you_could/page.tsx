"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data } from "./data";

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
            <BreadcrumbItem href="/grammar/if_you_could">
              If you could
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"If you could"}
            content={
              <>
                <br />
                <h2>
                  The goal of the game is to spark conversation, get to know
                  each other better, and have fun!
                  <br />
                  The starting player asks an "If You Could" question to the
                  group. <br />
                  <br />
                  <strong>For example:</strong>
                  <br />
                  "If you could travel anywhere in the world, where would you
                  go?" <br />
                  <br />
                  Each player takes turns answering the question. After everyone
                  has answered, players can discuss the responses. The game can
                  end whenever players choose, either after a set number of
                  rounds or when everyone feels satisfied.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList
          data={data}
          squareWidth={"33.333333%"}
          isCarousel
        />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={data}
          squareWidth={"33.333333%"}
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
