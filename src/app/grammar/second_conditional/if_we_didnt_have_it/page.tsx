"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
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
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/second_conditional">
              Second conditional
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/second_conditional/would_you">
              Would you...?
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"If we didn’t have it"}
            content={
              <>
                <br />
                <h2>
                  In this guessing game, students define things by making
                  conditional sentences about what life would be like without
                  the items.
                  <br />
                  <br />
                  One student looks at a card and makes 3 second conditional
                  definitions without saying what the item is. Another student
                  or teacher guesses what the item on the card is. <br />
                  <br />
                  Example: item on a card – <strong>phones</strong>. Possible
                  sentence:{" "}
                  <strong>
                    "If we didn’t have it, everybody would write and send
                    letters to each other"
                  </strong>
                  .
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList data={data} squareWidth={"33.33333%"} isCarousel />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={data}
          squareWidth={"33.33333%"}
          squareHeight="270"
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
