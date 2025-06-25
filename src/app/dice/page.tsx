"use client";

import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/be_going_to">
              Be going to
            </BreadcrumbItem>
            <BreadcrumbItem href="/dice">Boardgame Dice</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-[675px] bg-[#f9f9f9]">
          <iframe
            title="Sex Education Game"
            frameborder="0"
            width="100%"
            height="100%"
            src="https://view.genially.com/667aa9baa2db130014e7faee"
            type="text/html"
            allowscriptaccess="always"
            allowfullscreen="true"
            scrolling="yes"
            allownetworking="all"
          ></iframe>
        </div>
      </ContentWrapper>
    </main>
  );
}
