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
import { data1, data2 } from "./data";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Superlatives1 from "@/assets/images/superlatives1.png";
import Superlatives2 from "@/assets/images/superlatives2.png";

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
            <BreadcrumbItem href="/grammar/superlatives">
              Superlatives
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/superlatives/what_is_the_best">
              What is the best…?
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"What is the best…?"}
            content={
              <>
                <br />
                Students complete conversation questions with the superlative
                forms of the adjectives in brackets. Next, they take turns
                asking the conversation questions to their partner, e.g. "What
                was your best birthday?".
                <br />
                <br />
                Depending on your students' ability, they can give one-word
                answers or make sentences using the superlative adjective. Also
                they can ask each other follow up questions to elicit more
                details.
                <br />
                <br />
                <Link
                  href="/what_is_the_best_a"
                  target="_blank"
                  style={{ width: "100%" }}
                  className="text-primary underline"
                >
                  Questions for student A
                </Link>
                <br />
                <Link
                  href="/what_is_the_best_b"
                  target="_blank"
                  style={{ width: "100%" }}
                  className="text-primary underline"
                >
                  Questions for student B
                </Link>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <Zoom>
          <img src={Superlatives1.src} />
        </Zoom>
        <div className="h-10" />
        <div className="h-10" />
        <Zoom>
          <img src={Superlatives2.src} />
        </Zoom>
      </ContentWrapper>
    </main>
  );
}
