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
            <BreadcrumbItem href="/grammar/past_modals">
              Past modals
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/the_worst_advice">
              The worst advice
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"The worst advice"}
            content={
              <>
                <br />
                <div>
                  <strong>One person</strong> gives an{" "}
                  <strong>advice scenario</strong> (e.g., “I told my friend to
                  skip breakfast before a big meeting”).
                  <br />
                  <br />
                  The <strong>other person</strong> responds with how that
                  advice could have gone wrong, using{" "}
                  <strong>past modals</strong>.<br />
                  <br />
                  Example:
                  <br />
                  <ul>
                    <li data-list="bullet">
                      <strong>Person 1:</strong> “I told my friend to walk home
                      in the rain without an umbrella.”
                    </li>
                    <li data-list="bullet">
                      <strong>Person 2:</strong> “You should have told them to
                      take a taxi, shouldn’t you?”
                    </li>
                  </ul>
                  <br />
                  <strong>Goal:</strong>
                  <br />
                  Use <strong>should have</strong> and other past modals to
                  discuss <strong>what should have been done</strong> in the
                  past to avoid <strong>bad decisions</strong>.
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
