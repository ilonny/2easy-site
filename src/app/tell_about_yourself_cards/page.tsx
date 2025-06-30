"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { data } from "../grammar/infinitive_gerund/tell_about_yourself/data";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/infinitive_gerund">
              Infinitive gerund
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/infinitive_gerund/tell_about_yourself">
              Tell about yourself
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={data}
          squareHeight={"250px"}
          isGallery
          hideThumbnails
        />
      </ContentWrapper>
    </main>
  );
}
