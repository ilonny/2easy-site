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
            <BreadcrumbItem href="/grammar/present_perfect">
              Present perfect
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/present_perfect/never_have_i_ever">
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
                  This game is a perfect ice breaker for warm-up and a wonderful
                  speaking exercise to practice Present Perfect and Past Simple.
                </h2>
                <br />
                <strong>Procedure </strong>
                <br />
                Players take turns and read out “Never have I ever” statements.
                Other players must react to the heard phrase. Everyone who has
                ever had a similar experience shares their stories.
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList
          data={data}
          squareWidth={"33.33333%"}
          isCarousel
          hideDots
        />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={data}
          // squareWidth={"33.33333%"}
          isGallery
          withToggle
        />
      </ContentWrapper>
    </main>
  );
}
