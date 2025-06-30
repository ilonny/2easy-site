/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import MilestonesImage from "@/assets/images/milestones.png";
import Image from "next/image";

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
            <BreadcrumbItem href="/grammar/third_conditional">
              Third conditional
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/third_conditional/would_you">
              Milestones
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Milestones"}
            content={
              <>
                <br />
                <h2>
                  Ask your students to write 7-10 milestones which happened in
                  the last 5 years of their life (you can give it as homework).{" "}
                  <br />
                  <br />
                  Then ask your students to transform their milestones into
                  third conditional sentences.
                  <br />
                  <br />
                  Elicit more details about each sentence.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />

        <img src={MilestonesImage.src} alt="image" />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
