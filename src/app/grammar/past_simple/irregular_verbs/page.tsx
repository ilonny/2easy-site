/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Button } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { CheckboxList } from "@/components/CheckboxList";
import { data, data1, data2 } from "./data";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

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
            <BreadcrumbItem href="/grammar/past_simple">
              Past Simple
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_simple/irregular_verbs">
              Irregular verbs
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Irregular verbs"}
            content={
              <>
                <br />
                <h2>
                  This game helps students practice irregular verbs in speaking.
                  <br />
                  Students take turns rolling the dice and moving their counters
                  along the board. When a student lands on a square, they create
                  a past simple sentence using the verb in brackets and tell a
                  story based on that sentence. Other students can ask follow-up
                  questions. The game ends when the first student reaches the
                  finish.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
      </ContentWrapper>
      <iframe
        title="Past Simple board game"
        frameborder="0"
        width="1366"
        height="675"
        style={{ margin: "auto" }}
        src="https://view.genially.com/67bd9eaf6eeed3370530155f"
        type="text/html"
        allowscriptaccess="always"
        allowfullscreen="true"
        scrolling="yes"
        allownetworking="all"
      ></iframe>
    </main>
  );
}
