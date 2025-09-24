/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data } from "./data";
import PageImg from "@/assets/images/the_mystery_of_the_stolen_object.png";

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
            <BreadcrumbItem href="/grammar/the_passive">
              The Passive
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/the_passive/the_mystery_of_the_stolen_object">
              The mystery of the stolen object
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"The mystery of the stolen object"}
            content={
              <>
                <br />
                <h2>
                  One student secretly picks an object card.The other student’s
                  job is to guess what was stolen by asking only passive voice
                  questions. <br />
                  <br />
                  For example:
                  <br />
                  <ul>
                    <li data-list="bullet">"Was it eaten by anyone?"</li>
                    <li data-list="bullet">"Was it found in the kitchen?"</li>
                    <li data-list="bullet">"Was it made by hand?"</li>
                    <li data-list="bullet">
                      "Was it used by a famous person?"
                    </li>
                  </ul>
                  <br />
                  The student who "stole" the object can only answer in the
                  passive voice (e.g., "Yes, it was eaten," or "No, it wasn’t
                  made by hand").The student asking the questions has to guess
                  the object based on the answers.
                </h2>
              </>
            }
          />
          <img src={PageImg.src} style={{ width: 460 }} />
        </div>
        <div className="h-10" />
        <h2 style={{ fontStyle: "italic", fontSize: 22, textAlign: "center" }}>
          <em>Examples of objects:</em>
        </h2>
        <div className="h-5" />
        <SquareList data={data} squareWidth={"33.33333%"} isCarousel />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={data}
          squareWidth={"33.33333%"}
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
