"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
} from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import Link from "next/link";
import { data } from "./data";
import { GalleryList } from "@/components/GalleryList";

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
            <BreadcrumbItem href="/cards">Discussion cards</BreadcrumbItem>
            <BreadcrumbItem href="/cards/controversial_statements">
              Controversial Statements
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Controversial statements"}
            isOrange
            content={
              <>
                <br />
                <div>
                  There are 30 cards featuring controversial statements on
                  different topics. The point is to read a statement and not
                  only make a verdict - agree or disagree - but also provide
                  arguments and explain the reasoning behind your opinion. These
                  statements include thought-provoking topics that stimulate
                  critical thinking.
                  <br />
                  <br />
                  For group activities, we recommend splitting the class into
                  two teams. Give both teams one controversial statement, with
                  one team presenting arguments 'for' and the other team
                  presenting arguments 'against' the statement.
                </div>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList data={data} isCarousel />
        <div className="h-10" />
        <SquareList data={data} isGallery withToggle squareWidth="33.33333%" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
