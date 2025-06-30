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
import { data, studentA, studentB } from "./data";
import { GalleryList } from "@/components/GalleryList";
import { CheckboxList } from "@/components/CheckboxList";

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
            <BreadcrumbItem href="/grammar/future_simple">
              Future Simple
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/future_simple/i_see_your_future">
              I see your future
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"I see your future"}
            content={
              <>
                <br />
                <h2>
                  Practice the Future Simple tense by making funny predictions
                  about each other’s futures. <strong> </strong>
                  <br />
                  <br />
                  Each student will take turns playing the roles of "fortune
                  teller" and "client." The fortune teller will use the Future
                  Simple tense to make predictions about the client’s future.
                  The client will ask questions about the future, such as:
                  "Where will I live in 10 years?" The fortune teller will then
                  create a prediction based on the card that appears, such as "
                  I see great things for you! In 10 years, you will live in a
                  castle made of cheese!"
                </h2>
                <br />
                <div class="tn-atom" field="tn_text_1719316238782">
                  Use cards from{" "}
                  <a
                    href="https://www.evatarot.net/"
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      color: "rgb(2, 96, 232)",
                      textDecoration: "underline",
                    }}
                  >
                    this website
                  </a>{" "}
                  to make predictions. You may choose only one card for one
                  prediction.
                </div>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="w-[50%]">
          <CheckboxList data={data} isText title="Examples of questions:" />
        </div>
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
