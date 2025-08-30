"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { data } from "./data";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          GRAMMAR
        </h1>
        <p
          className="max-w-[600px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
        >
          В этом разделе нет теории, правил и заданий на раскрытие скобок. Мы
          собрали здесь только разговорные упражнения и игры, чтобы после
          прохождения грамматической темы ученик сразу мог отработать ее в речи
        </p>
        <div className="h-10" />
        <SquareList data={data} />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
