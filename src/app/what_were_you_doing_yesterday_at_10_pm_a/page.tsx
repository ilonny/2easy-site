"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { studentA } from "../grammar/past_continuous/what_were_you_doing_yesterday_at_10_pm/data";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_continuous">
              Past Continuous
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_continuous/what_were_you_doing_yesterday_at_10_pm">
              What were you doing yesterday at 10 pm?
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={studentA}
          squareWidth={"33.333333%"}
          squareHeight={"250px"}
          isGallery
        />
      </ContentWrapper>
    </main>
  );
}
