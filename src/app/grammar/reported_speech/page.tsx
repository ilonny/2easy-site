"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
            <BreadcrumbItem href="/grammar/reported_speech">
              Reported speech
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          REPORTED SPEECH
        </h1>
        <div className="h-10" />
        <SquareList data={data} />
        <div className="h-10" />
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
