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
import { data, studentA, studentB } from "./data";
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
            <BreadcrumbItem href="/grammar/present_simple">
              Present Simple
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/present_simple/awkward_interview">
              Awkward interview
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Awkward interview"}
            content={
              <>
                <br />
                <h2>
                  Students take turns rolling the dice and moving their counters
                  along the board. When a student lands on a square, they
                  discuss the topic indicated on that square using the present
                  simple tense.
                  <br />
                  <br />
                  The other students listen carefully, correct any mistakes, and
                  ask follow-up questions to encourage further discussion.
                  <br />
                  <br />
                  The game continues until a student reaches the finish line, at
                  which point the game ends.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
      </ContentWrapper>
      <iframe
        title="board lie detective"
        frameborder="0"
        width="1366"
        height="675"
        style={{ margin: "auto" }}
        src="https://view.genially.com/6798ac9c3baff86e94617920"
        type="text/html"
        allowscriptaccess="always"
        allowfullscreen="true"
        scrolling="yes"
        allownetworking="all"
      ></iframe>
    </main>
  );
}
