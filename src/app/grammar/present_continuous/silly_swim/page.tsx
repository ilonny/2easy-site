"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Chip } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { data } from "./data";
import SillySwimImage from "@/assets/images/grammar/present_continuous/silly_swim/1.png";

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
            <BreadcrumbItem href="/grammar/present_continuous">
              Present continuous
            </BreadcrumbItem>
            <BreadcrumbItem href="/grammar/present_continuous/silly_swim">
              Silly Swim
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"Silly Swim"}
            content={
              <>
                <br />
                <h2>
                  In this memory game, students for a minute look carefully at a
                  pool scene picture and try to remember what the people are
                  doing there. Then you hide the picture and students say what
                  they remember using the present continuous sentences. The
                  words above the picture help students remember it.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <div className="flex flex-wrap justify-center max-w-[800px] gap-4 w-[100%] m-auto">
          {data.map((d) => {
            return (
              <Chip
                size="lg"
                color="warning"
                key={d}
                className="bg-[#fff27b]"
                radius="none"
              >
                <p
                  style={{
                    textTransform: "uppercase",
                    // color: "#fff",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {d}
                </p>
              </Chip>
            );
          })}
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <SquareList
          data={[{ bgImage: SillySwimImage, id: 1 }]}
          squareWidth={"100%"}
          isGallery
          withToggle
          toggleLabel={["Open the picture", "Hide the picture"]}
        />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
