"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { data } from "./data";
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

  const [currentIndex, setCurrentIndex] = useState(1);
  const [version, setVersion] = useState<"Short video" | "Full version">(
    "Short video"
  );

  const currentVideo = useMemo(() => {
    const el = data.find((el) => el.id === Number(currentIndex));
    const video =
      version === "Short video" ? el?.shortVersion : el?.fullVersion;
    return video;
  }, [currentIndex, version]);
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/speaking_games">
              Speaking games
            </BreadcrumbItem>
            <BreadcrumbItem href="/speaking_games/what_happens_next">
              What happens next
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end gap-4">
          <PageLeftBlock
            title={"what happens next"}
            content={
              <>
                <br />
                <h2 class="tn-atom" field="tn_text_1692109110889">
                  You watch a short video and try to guess what happens next.
                  Then you say your prediction about each video using “be going
                  to”, for example:{" "}
                  <strong>
                    <em>“He is going to fall down!”.</em>
                  </strong>{" "}
                  After making a prediction you check your guess by watching a
                  full video.
                </h2>
              </>
            }
          />
        </div>
        <div className="h-10" />
        <Tabs
          color="primary"
          size="lg"
          aria-label="Tabs"
          radius={"none"}
          selectedKey={currentIndex}
          onSelectionChange={(val) => {
            setCurrentIndex(val);
            setVersion("Short video");
          }}
          className="w-full wrap flex-wrap flex"
          fullWidth
          classNames={{
            tabList: "flex flex-wrap wrap justify-between",
            tab: "w-[100%] lg:w-[9%]",
          }}
        >
          {data.map((tab) => {
            return <Tab key={tab.id} title={tab.id} />;
          })}
        </Tabs>
        <div className="h-10" />
        <div
          className="w-full"
          dangerouslySetInnerHTML={{ __html: currentVideo || "" }}
        />
        <div className="h-10" />
        <Tabs
          color="primary"
          size="lg"
          aria-label="Tabs"
          radius={"none"}
          selectedKey={version}
          onSelectionChange={(val) => setVersion(val)}
          fullWidth
          classNames={{
            tabList: "flex flex-wrap wrap justify-between max-w-[500px] m-auto",
            tab: "w-[100%] lg:w-[49%]",
          }}
        >
          <Tab key={"Short video"} title={"Short video"} />
          <Tab key={"Full version"} title={"Full version"} />
        </Tabs>
        <div className="h-10" />
        <div className="h-10" />
        <Link
          className="text-primary underline text-center block"
          href="https://drive.google.com/drive/folders/1gULCChRDPbH4kyXRfE418v6OnjMMMGsK?usp=sharing"
          target="_blank"
        >
          Link to the videos
        </Link>
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
