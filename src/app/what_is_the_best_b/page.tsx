/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { data1 } from "../grammar/wh_questions/ask_the_right_question/data";
import { CheckboxList } from "@/components/CheckboxList";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Superlatives1 from "@/assets/images/superlatives1.png";
import Superlatives2 from "@/assets/images/superlatives2.png";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/superlatives">
              Superlatives
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/superlatives/what_is_the_best">
              What is the best...?
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <Zoom>
          <img src={Superlatives2.src} />
        </Zoom>
      </ContentWrapper>
    </main>
  );
}
