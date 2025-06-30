"use client";

import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { data2 } from "../grammar/wh_questions/guess_the_word/data";
import { CheckboxList } from "@/components/CheckboxList";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/wh_questions">
              WH questions
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/wh_questions/guess_the_word">
              Guess the word
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex justify-center">
          <div className="w-[50%] p-2">
            <CheckboxList data={data2} title="Student B" />
          </div>
        </div>
      </ContentWrapper>
    </main>
  );
}
