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
            <BreadcrumbItem href="/grammar/first_condition">
              First Conditional
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/first_condition/if_i_were_a_fortune_teller">
              If i were a fortune teller
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"If i were a fortune teller"}
            content={
              <>
                <br />
                <>
                  <div>
                    Provide students with a list of silly and unexpected
                    situations. For example: "If I win the lottery," "If I
                    become a superhero," "If I meet an alien," "If I find a
                    unicorn," etc. The person acts as the "fortune teller" and
                    predicts the future based on the given situation.
                    <br />
                    The "client" (the person who gets the prediction) asks,
                    "What will happen if [situation] happens?" The fortune
                    teller responds using the first conditional, but the more
                    absurd and humorous, the better!
                    <br />
                    <br />
                    <strong>Example:</strong>
                    <br />
                    <ul>
                      <li data-list="bullet">
                        <strong>Client</strong>: "What will happen if I win the
                        lottery?"
                      </li>
                      <li data-list="bullet">
                        <strong>Fortune teller</strong>: "If you win the
                        lottery, you will buy a pet giraffe.
                      </li>
                    </ul>
                  </div>
                  <br />
                  <Link
                    href="/if_i_were_a_fortune_teller_a"
                    target="_blank"
                    className="text-primary underline"
                  >
                    Cards for student A
                  </Link>
                  <br />
                  <Link
                    target="_blank"
                    href="/if_i_were_a_fortune_teller_b"
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
          squareWidth={"33.33333%"}
          squareHeight={"250px"}
          isGallery
        />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={studentB}
          squareWidth={"33.33333%"}
          squareHeight={"250px"}
          isGallery
        />
      </ContentWrapper>
    </main>
  );
}
