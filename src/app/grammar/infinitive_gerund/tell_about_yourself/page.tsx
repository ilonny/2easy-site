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
            <BreadcrumbItem href="/grammar/infinitive_gerund">
              Infinitive gerund
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/infinitive_gerund/tell_about_yourself">
              Tell about yourself
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Tell about yourself"}
            content={
              <>
                <br />
                <h2>
                  Each student selects a question and fills in the blank with
                  the appropriate verb form (gerund or infinitive). After
                  completing the question, students should answer it using a
                  full sentence.
                  <br />
                  <br />
                  Pair students up to discuss their answers and related topics,
                  encouraging the use of gerunds and infinitives in their
                  conversations.
                </h2>
                <br />
                <Link
                  href="/tell_about_yourself_cards"
                  target="_blank"
                  style={{ width: "100%" }}
                  className="text-primary underline"
                >
                  Link to the cards
                </Link>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList data={data} isGallery squareHeight="230px" hideThumbnails />
        <div className="h-10" />
        <SquareList
          data={data}
          isGallery
          withToggle
          squareHeight="230px"
          toggleLabel={["Show the answers", "Hide the answers"]}
        />
      </ContentWrapper>
    </main>
  );
}
