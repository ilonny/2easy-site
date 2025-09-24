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
            <BreadcrumbItem href="/grammar/used_to">Used to</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/used_to/dream_job_comparison">
              Dream job comparison
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Dream job comparison"}
            content={
              <>
                <br />
                Students will pick two professions — one historical and one
                modern — and use "used to" to describe the differences in job
                responsibilities, tools, and work environments.
                <br />
                <br />
                <h2>
                  <strong>
                    <em>Example:</em>
                  </strong>
                  <br />
                  <em>
                    "A telegraph operator used to send messages using Morse
                    code.
                  </em>
                  <br />
                  <em>Now, we use emails and instant messaging."</em>
                </h2>
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
