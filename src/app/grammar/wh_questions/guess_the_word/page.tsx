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
import { data1, data2 } from "./data";
import Link from "next/link";

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
            <BreadcrumbItem href="/grammar/wh_questions">
              WH questions
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/wh_questions/guess_the_word">
              Guess the word
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Guess the word"}
            content={
              <>
                <br />
                <div>
                  This game is like Alias where you explain words and your
                  partner should guess them, but in this game instead of
                  explanation you have to ask the right questions to help your
                  partner guess the words from your list.
                  <br />
                  <br />
                  Set a 7-minute time limit for each student, after 7 minutes
                  stop the first student and swap roles. When everyone has
                  finished, pairs add up their points for each guessed word.
                </div>
                <br />
                <strong>For example</strong>
                <br />
                <div>
                  There is a word <strong>“green”</strong> in your list and you
                  ask your partner <strong>"What is the color of grass?</strong>
                </div>
                <br />
                <Link
                  href="/guess_the_word_a"
                  target="_blank"
                  style={{ width: "100%" }}
                  className="text-primary underline"
                >
                  Words for student A
                </Link>
                <br />
                <Link
                  href="/guess_the_word_b"
                  target="_blank"
                  style={{ width: "100%" }}
                  className="text-primary underline"
                >
                  Words for student B
                </Link>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="flex">
          <div className="w-[50%] p-2">
            <CheckboxList data={data1} title="Student A" />
          </div>
          <div className="w-[50%] p-2">
            <CheckboxList data={data2} title="Student B" />
          </div>
        </div>
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
