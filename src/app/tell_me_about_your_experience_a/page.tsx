"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { studentA } from "../grammar/past_simple_present_perfect/tell_me_about_your_experience/data";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_simple_present_perfect">
              Past Simple & Present Perfect
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_simple_present_perfect/tell_me_about_your_experience">
              Tell me about your experience!
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={studentA}
          squareWidth={"33.33333%"}
          squareHeight={"250px"}
          isGallery
        />
      </ContentWrapper>
    </main>
  );
}
