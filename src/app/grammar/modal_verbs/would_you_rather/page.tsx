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
            <BreadcrumbItem href="/grammar/modal_verbs">
              Modal verbs
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/modal_verbs/would_you_rather">
              Would you rather
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={'"Would you rather?"'}
            content={
              <>
                with Modal Verbs
                <br />
                <br />
                <h2>
                  Use modal verbs in "Would you rather" questions to discuss
                  funny choices.
                  <br />
                  Students take turns answering the questions. They must use{" "}
                  <strong>modal verbs</strong> to explain why they would choose
                  one option over the other.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList data={data} isCarousel />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
