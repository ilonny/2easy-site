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
            <BreadcrumbItem href="/speaking_games">
              Speaking games
            </BreadcrumbItem>
            <BreadcrumbItem href="/speaking_games/Bingo">Bingo</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Bingo"}
            content={
              <>
                <br />
                <h2>
                  The point of Bingo is to be the first to complete a specific
                  pattern on your card and shout "Bingo!" Use unique cards on
                  different topics with various situations (e.g., "Got a
                  promotion").
                  <br />
                  <br />
                  The caller or players take turns announcing a situation, and
                  the other players cover it if they have it. The game continues
                  until someone completes a winning pattern (row, column, or
                  diagonal).
                  <br />
                  <br />
                  The first to shout "Bingo!" wins, and everyone shares their
                  stories related to the different situations on their cards and
                  asks each other for more details.
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
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
