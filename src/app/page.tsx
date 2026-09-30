"use client";
import { MainHero } from "@/components/MainHero";
import { MainContent } from "@/components/MainContent";
import { MainPrep } from "@/components/MainPrep";
import { MainDelivery } from "@/components/MainDelivery";
import { MainReview } from "@/components/MainReview";
import { MainTariffs } from "@/components/MainTariffs";
import { MainFaq } from "@/components/MainFaq";
import { MainFinalCta } from "@/components/MainFinalCta";

export default function Home() {
  return (
    <div className="flex flex-col gap-[110px] pb-5 lg:gap-[145px] lg:pb-[145px]">
      <MainHero />
      <MainContent />
      <MainPrep />
      <MainDelivery />
      <MainReview />
      <MainTariffs />
      <MainFaq />
      <MainFinalCta />
    </div>
  );
}
