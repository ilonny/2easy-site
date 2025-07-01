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
import { studentA, studentB } from "./data";
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
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_simple_present_perfect">
              Past Simple & Present Perfect
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_simple_present_perfect/tell_me_about_your_experience">
              Tell me about your experience!
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Tell me about your experience!"}
            content={
              <>
                <br />
                <>
                  <div class="tn-atom" field="tn_text_1690892916109">
                    Students take turns asking <strong>Present Perfect</strong>{" "}
                    questions (e.g., "Have you ever eaten something so spicy you
                    almost cried?") and following up with a{" "}
                    <strong>Past Simple</strong> questions for more details
                    (e.g., "What did you eat, and how did you survive the
                    heat?").
                  </div>
                  <br />
                  <Link
                    href="/tell_me_about_your_experience_a"
                    target="_blank"
                    className="text-primary underline"
                  >
                    Cards for student A
                  </Link>
                  <br />
                  <Link
                    target="_blank"
                    href="/tell_me_about_your_experience_b"
                    className="text-primary underline"
                  >
                    Cards for student B
                  </Link>
                </>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={studentA}
          squareWidth={"33.333333%"}
          squareHeight={"250px"}
          isGallery
        />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={studentB}
          squareWidth={"33.333333%"}
          squareHeight={"250px"}
          isGallery
        />
      </ContentWrapper>
    </main>
  );
}
