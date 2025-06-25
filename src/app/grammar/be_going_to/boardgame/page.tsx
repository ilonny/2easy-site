"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Button } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
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
            <BreadcrumbItem href="/grammar/be_going_to">
              Be going to
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/be_going_to/boardgame">
              Boardgame
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={'board game "Lie detective"'}
            content={
              <>
                <br />
                It is a be going to true or false board game.
                <br />
                <br />
                Students take turns rolling the dice and moving their counter
                along the board. When a student lands on a square, they roll the
                true or false dice and look at it, without saying or showing
                anyone. The student then presses on a square and makes a be
                going to statement about the topic on the square according to
                the true or false dice.
                <br />
                <br />
                The other students then ask be going to Wh questions to
                determine if the student is lying or telling the truth. After a
                few questions have been answered, the group members guess
                whether the student's answer is true or false. The student then
                reveals the answer.
                <br />
                <br />
                One correct guess - one point. When a student reaches the
                finish, the game ends and the points are added up. The student
                with the most points wins the game.
              </>
            }
          />
          <Link href="/dice" target="_blank" style={{ width: "100%" }}>
            <Button fullWidth size="lg" variant="shadow" color="primary">
              Open true/false dice
            </Button>
          </Link>
        </div>
        <div className="h-10" />
      </ContentWrapper>
      <div className="h-[913px] bg-[#f9f9f9]" style={{ minHeight: "102vh" }}>
        <iframe
          title="Sex Education Game"
          frameborder="0"
          width="100%"
          height="675"
          style={{
            width: "100%",
            height: "100%",
          }}
          src="https://view.genially.com/667681faf417110014088630"
          type="text/html"
          allowscriptaccess="always"
          allowfullscreen="true"
          scrolling="yes"
          allownetworking="all"
        ></iframe>
      </div>
    </main>
  );
}
