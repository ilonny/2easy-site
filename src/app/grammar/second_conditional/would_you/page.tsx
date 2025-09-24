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
            title={"Would you…?"}
            content={
              <>
                <br />
                <h2>
                  Complete the questions on the cards using the second
                  conditional then discuss them. Feel free to ask follow-up
                  questions.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList data={data} squareWidth={"33.33333%"} isCarousel />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
