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
            <BreadcrumbItem href="/grammar/wh_questions/ask_the_right_question">
              Ask the right question
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Ask the right question"}
            content={
              <>
                <br />
                <div>
                  Ask the right questionIn this game, students guess questions
                  from short answers written by other students or a teacher.
                  First, students write short answers for the questions on their
                  card. Then they swap their answers and play a game where they
                  guess Wh questions from the short answers written by the other
                  students.
                  <br />
                  <br />
                  Ask the right questionIn this game, students guess questions
                  from short answers written by other students or a teacher.
                  First, students write short answers for the questions on their
                  card. Then they swap their answers and play a game where they
                  guess Wh questions from the short answers written by the other
                  students. If students have problems thinking of the right
                  question, the student who wrote the answer can give clues,
                  e.g. "It's a question about family."
                </div>
                <br />
                <Link
                  href="/ask_the_right_question_a"
                  target="_blank"
                  style={{ width: "100%" }}
                  className="text-primary underline"
                >
                  Questions for student A
                </Link>
                <br />
                <Link
                  href="/ask_the_right_question_b"
                  target="_blank"
                  style={{ width: "100%" }}
                  className="text-primary underline"
                >
                  Questions for student B
                </Link>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="flex">
          <div className="w-[50%] p-2">
            <CheckboxList data={data1} title="Student A" isText />
          </div>
          <div className="w-[50%] p-2">
            <CheckboxList data={data2} title="Student B" isText />
          </div>
        </div>
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
