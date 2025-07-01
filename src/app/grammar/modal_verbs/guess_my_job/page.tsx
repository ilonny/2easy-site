/* eslint-disable jsx-a11y/alt-text */
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
import { data, data1, data2 } from "./data";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

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
            <BreadcrumbItem href="/grammar/modal_verbs">
              Modal verbs
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/modal_verbs/guess_my_job">
              Guess my job
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Guess my job"}
            content={
              <>
                <h2>
                  Students will practice using modal verbs (have to, don’t have
                  to, must, mustn’t) while guessing different jobs.
                  <br />
                  <br />
                  <strong>Instructions:</strong>
                  <br />
                  <ol>
                    <li data-list="ordered">
                      <strong>Pair up with a partner.</strong> One student
                      thinks of a job and describes it using only modal verbs (
                      <em>have to, don’t have to, must, mustn’t</em>), without
                      revealing the job title.
                    </li>
                    <li data-list="ordered">
                      <strong>The partner must guess</strong> the job within a
                      time limit (e.g., 1 minute).
                    </li>
                    <li data-list="ordered">
                      If the partner guesses correctly, they earn{" "}
                      <strong>1 point</strong>.
                    </li>
                    <li data-list="ordered">After each round, switch roles.</li>
                  </ol>
                  <br />
                  Then create descriptions for the following jobs and play with
                  a partner:{" "}
                  <strong style={{ backgroundColor: "rgb(242, 255, 205)" }}>
                    actor, entrepreneur, accountant, vet, programmer, window
                    washer, fashion stylist, poker player, bartender, drummer in
                    a rock band
                  </strong>
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <SquareList data={data} isCarousel />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
