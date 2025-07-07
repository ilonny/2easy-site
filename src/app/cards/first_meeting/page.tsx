"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
} from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import Link from "next/link";
import { data } from "./data";
import { GalleryList } from "@/components/GalleryList";

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
            <BreadcrumbItem href="/cards">Discussion cards</BreadcrumbItem>
            <BreadcrumbItem href="/cards/first_meeting">
              First Meeting
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"First Meeting"}
            isOrange
            content={
              <>
                <br />
                <h2>
                  If you are tired of asking the same questions, such as “What
                  is your hobby?” or “How many siblings do you have?” with all
                  your new students, this set of cards is definitely for you.
                  Here, you will find non-trivial and truly interesting
                  questions for your first meeting with a student.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList data={data} isCarousel />
        <div className="h-10" />
        <SquareList data={data} isGallery withToggle squareWidth="33.33333%" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
