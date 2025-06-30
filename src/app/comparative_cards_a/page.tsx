"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { studentA } from "../grammar/comparatives/comparative_clues/data";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <Breadcrumbs>
              <BreadcrumbItem href="/">Главная</BreadcrumbItem>
              <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
              <BreadcrumbItem href="/grammar/comparatives">
                Comparatives
              </BreadcrumbItem>
              <BreadcrumbItem href="/grammar/comparatives/comparative_clues">
                Comparative clues
              </BreadcrumbItem>
            </Breadcrumbs>
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
