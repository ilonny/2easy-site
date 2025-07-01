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
            <BreadcrumbItem href="/grammar/who_am_i">Who am i</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Who am i"}
            content={
              <>
                <br />
                <div>
                  Player A (the <strong>Thinker</strong>) secretly chooses a
                  famous person or character.
                  <br />
                  Player B (the <strong>Guesser</strong>) must figure out who it
                  is—but with a twist!
                  <br />
                  <br />
                  The Guesser asks up to{" "}
                  <strong>5 direct yes/no questions</strong> without using
                  question tags.
                  <br />
                  <br />
                  <strong>For example:</strong>
                  <br />
                  <ul>
                    <li data-list="bullet">"Is the person a woman?"</li>
                    <li data-list="bullet">"Does she sing?"</li>
                    <li data-list="bullet">"Is she American?"</li>
                    <li data-list="bullet">
                      The Thinker answers each question truthfully with{" "}
                      <strong>yes</strong> or <strong>no</strong>.
                    </li>
                  </ul>
                  <br />
                  📌
                  <strong>
                    {" "}
                    <em>
                      Important: The Guesser cannot take notes and must remember
                      the answers!
                    </em>
                  </strong>
                  <br />
                  <br />
                  Then, the Guesser must{" "}
                  <strong>
                    restate the information they gathered using question tags
                  </strong>{" "}
                  to confirm.
                  <br />
                  <br />
                  <strong>For example:</strong>
                  <br />
                  <ul>
                    <li data-list="bullet">"She’s a woman, isn’t she?"</li>
                    <li data-list="bullet">"She sings, doesn’t she?"</li>
                    <li data-list="bullet">"She isn’t British, is she?"</li>
                  </ul>
                  <br />
                  Player A confirms or corrects the Guesser's tags.Once all tags
                  have been confirmed or corrected, the Guesser has{" "}
                  <strong>one final chance</strong> to guess who it is.
                </div>
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
