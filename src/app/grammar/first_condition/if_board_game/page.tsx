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
            <BreadcrumbItem href="/grammar/first_condition">
              First Condition
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/first_condition/if_board_game">
              If...! Board game
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"If...! Board game"}
            content={
              <>
                <br />
                <h2>
                  In this first conditional board game, students practice making
                  first conditional sentences from prompts. <br />
                  <br />
                  Students take turns rolling the dice and moving their counter
                  along the board. When a student lands on a square, they read
                  the prompt and make a first conditional sentence beginning
                  with{" "}
                  <strong>
                    <em>If</em>...
                  </strong>{" "}
                  Students can finish the sentence any way they like, but it
                  must contain the words in the square, be appropriate and
                  grammatically correct. <br />
                  <br />
                  If a student lands on a square{" "}
                  <span style={{ backgroundColor: "rgb(230, 255, 178)" }}>
                    marked{" "}
                  </span>
                  <em style={{ backgroundColor: "rgb(230, 255, 178)" }}>IF</em>,
                  they can make any first conditional sentence they want.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
      </ContentWrapper>
      <iframe
        title="board"
        frameborder="0"
        width="1366"
        height="675"
        style={{ margin: "auto" }}
        src="https://view.genially.com/67dd667c68da3838d12eb3c2"
        type="text/html"
        allowscriptaccess="always"
        allowfullscreen="true"
        scrolling="yes"
        allownetworking="all"
      ></iframe>
    </main>
  );
}
