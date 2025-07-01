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
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/i_wish">
              I wish (Past & Present)
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/i_wish/i_wish">
              I wish...
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"I wish..."}
            content={
              <>
                <br />
                <div>
                  Use <strong>“I wish”</strong> to create sentences in the{" "}
                  <strong>past</strong> or <strong>present</strong> based on
                  situations drawn from cards.
                  <br />
                  <br />
                  <strong>There are cards</strong> with different{" "}
                  <strong>situations</strong>:<br />
                  <ul>
                    <li data-list="bullet">
                      <strong>Present Wishes</strong> (unreal, impossible now)
                    </li>
                    <li data-list="bullet">
                      <strong>Past Wishes</strong> (regrets or missed
                      opportunities)
                    </li>
                  </ul>
                  <br />
                  Look at a card and create a sentence.
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
