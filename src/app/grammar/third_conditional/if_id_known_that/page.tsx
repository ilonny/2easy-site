"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data } from "./data";
import MilestonesImage from "@/assets/images/if_id_known_that.png";

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
            <BreadcrumbItem href="/grammar/third_conditional/if_id_known_that">
              if I’d known that…
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"if I’d known that…"}
            content={
              <>
                <br />
                <h2>
                  There are some situations in the past. We pretend that you had
                  them all, read a situation and rephrase it using the third
                  conditional (It would be great if you come up with 2-3
                  possible sentences for each situation).
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <img src={MilestonesImage.src} alt="image" />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList data={data} squareWidth={"33.33333%"} isCarousel />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={data}
          squareWidth={"50%"}
          squareHeight="270"
          isGallery
          withToggle
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
