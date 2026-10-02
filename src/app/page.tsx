"use client";
import { MainHero } from "@/components/MainHero";
import { MainContent } from "@/components/MainContent";
import { MainPrep } from "@/components/MainPrep";
import { MainDelivery } from "@/components/MainDelivery";
import { MainReview } from "@/components/MainReview";
import { MainTariffs } from "@/components/MainTariffs";
import { MainFaq } from "@/components/MainFaq";
import { MainFinalCta } from "@/components/MainFinalCta";
import { useLandingZoom } from "@/hooks/useLandingZoom";

export default function Home() {
  useLandingZoom();

  return (
    <div className="relative z-[2] flex flex-col gap-[110px] rounded-b-[40px] bg-white pb-5 lg:gap-[145px] lg:rounded-b-[60px] lg:pb-[145px]">
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
