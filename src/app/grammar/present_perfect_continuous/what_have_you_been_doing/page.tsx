"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data } from "./data";

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
            <BreadcrumbItem href="/grammar/present_perfect_continuous">
              Present Perfect Continuous
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/present_perfect_continuous/what_have_you_been_doing">
              What have you been doing
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"What have you been doing"}
            content={
              <>
                <br />
                <h2>
                  Students have a card of something they have been doing and the
                  result of it. <br />
                  One student reads a sentence with a result, for example, “I’m
                  tired!”.
                  <br />
                  Another student tries to guess why this has happened and what
                  the student has been doing previously. Using the Present
                  Perfect Continuous the first student asks the questions, for
                  example,{" "}
                  <strong>
                    <u>“Have you been walking in the forest?”</u>
                  </strong>
                  .
                </h2>
                <br />
                Students have 5-6 tries to get the correct answer. After five or
                six tries, the student who has the card tells what they have
                been doing previously.
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList data={data} squareWidth={"33.333333%"} isCarousel />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={data}
          squareWidth={"33.333333%"}
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
