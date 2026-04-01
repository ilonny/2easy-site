"use client";
import Link from "next/link";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { SubscribeTariffs } from "@/subscribe/components/SubscribeTariffs";
import { SubscribeFreeBlock } from "@/subscribe";
import { AuthContext } from "@/auth";
import { useContext } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { useTranslation } from "react-i18next";

export default function StartRegistrationPage() {
  const { t } = useTranslation();
  const { isAuthorized, authIsLoading } = useContext(AuthContext);
  const { subscription } = useContext(SibscribeContext);

  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full max-w-[771px] min-w-0">
          <div className="h-8 md:h-10 lg:h-14" />
          <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch] pb-0.5">
            <Breadcrumbs>
            <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
            <BreadcrumbItem>{t("header.subscription")}</BreadcrumbItem>
          </Breadcrumbs>
          </div>
        </div>
        <div className="h-6 md:h-8 lg:h-10" />
        <div className="h-6 md:h-8 lg:h-10" />
        <div className="flex flex-col items-center w-full max-w-full px-0">
          <h1 className="text-primary font-bold text-xl sm:text-2xl md:text-3xl uppercase text-center px-1">
            {t("subscription.title")}
          </h1>
          <div className="h-3" />
          <h2 className="font-medium text-base sm:text-lg text-center px-2">
            {t("subscription.page.subtitle")}
          </h2>
          <div className="h-5" />
          <p className="text-center max-w-[750px] px-2 text-sm sm:text-base leading-relaxed">
            {t("subscription.page.description1")}
            <br />
            <br />
            {t("subscription.page.description2")}{" "}
            <span className="underline">https://my.cloudpayments.ru</span>
          </p>
          <div className="h-10" />
          <div className="h-10" />

          <SubscribeTariffs hideTitle />
          <div className="h-10" />
          <div className="h-10" />
          <div className="h-10" />
          <div className="h-10" />
          <div className="h-10" />
        </div>
      </ContentWrapper>
    </main>
  );
}
