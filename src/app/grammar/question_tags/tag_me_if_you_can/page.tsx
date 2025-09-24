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
            <BreadcrumbItem href="/grammar/question_tags">
              Question tags
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/tag_me_if_you_can">
              Tag me if you can
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Tag me if you can"}
            content={
              <>
                <br />
                <div>
                  One person says a line imagining they’re somewhere in the
                  world (or doing something exciting), and ends it with a
                  question tag. The other person responds{" "}
                  <strong>in character</strong>—with emotion, an accent, or
                  extra detail!
                  <br />
                  <br />
                  <strong>Example:</strong>
                  <br />
                  <br />– “We’re riding camels in Egypt, aren’t we?”
                  <br />– “We are, and I’m sweating like crazy!”
                  <br />
                  <br />– “This sandstorm won’t last long, will it?”
                  <br />– “It better not — I left the sunscreen at home!”
                </div>
              </>
            }
          />
        </div>
        <div className="h-10" />
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
