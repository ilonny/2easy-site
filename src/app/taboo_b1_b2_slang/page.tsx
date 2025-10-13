"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { dataSlang } from "../speaking_games/taboo/data";

export default function GrammarPage() {
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={dataSlang}
          squareWidth={"33.33333%"}
          squareHeight={"250px"}
          isGallery
        />
      </ContentWrapper>
    </main>
  );
}
