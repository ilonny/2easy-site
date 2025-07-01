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
            <BreadcrumbItem href="/grammar/i_wish/i_knew">
              I Wish I Knew!
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"I Wish I Knew!"}
            content={
              <>
                <br />
                <div>
                  <strong>Player 1</strong> starts by making a{" "}
                  <strong>present wish</strong> about something they{" "}
                  <strong>wish they could do</strong> right now, but it’s
                  impossible or silly.
                  <br />
                  <ul>
                    <li data-list="bullet">
                      Example: “I wish I could <strong>eat pizza</strong>{" "}
                      without ever getting full!”
                    </li>
                  </ul>
                  <br />
                  <strong>Player 2</strong> answers with a{" "}
                  <strong>past wish</strong> about something they{" "}
                  <strong>wish they had done</strong> differently.
                  <br />
                  <ul>
                    <li data-list="bullet">
                      Example: “I wish I <strong>hadn’t eaten</strong> so much
                      pizza last night. Now I feel terrible!”
                    </li>
                  </ul>
                  <br />
                  After Player 1 and Player 2 both share their wishes, they swap
                  roles. Player 2 starts with a <strong>present wish </strong>
                  and Player 1 answers with a <strong>past wish</strong>.
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
