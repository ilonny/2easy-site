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
            <BreadcrumbItem href="/grammar/past_continuous">
              Past Continuous
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/past_continuous/what_were_you_doing_yesterday_at_10_pm">
              What were you doing yesterday at 10 pm?
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"What were you doing yesterday at 10 pm?"}
            content={
              <>
                <br />
                <>
                  <div>
                    Divide students into pairs or small groups. Provide each
                    student with a list of actions. One student from each pair
                    will choose an action from the list and act it out without
                    speaking.
                    <br />
                    Their partner will guess the action using the Past
                    Continuous tense (e.g., "You were talking to your friend
                    yesterday at 10 PM").
                    <br />
                    After guessing the actions, ask students to create a short
                    story incorporating the actions they performed. Encourage
                    them to add details about each action, such as:
                    <br />
                    <ol>
                      <li data-list="ordered">Who they were with</li>
                      <li data-list="ordered">Why they were doing it</li>
                      <li data-list="ordered">
                        How they felt during the action
                      </li>
                    </ol>
                    Have students share their stories with the class or in small
                    groups. Encourage them to use the Past Continuous tense
                    throughout their storytelling.
                  </div>
                  <br />
                  <Link
                    href="/what_were_you_doing_yesterday_at_10_pm_a"
                    target="_blank"
                    className="text-primary underline"
                  >
                    Cards for student A
                  </Link>
                  <br />
                  <Link
                    target="_blank"
                    href="/what_were_you_doing_yesterday_at_10_pm_b"
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
        <SquareList
          data={studentA}
          squareWidth={"33.333333%"}
          squareHeight={"250px"}
          isGallery
        />
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
