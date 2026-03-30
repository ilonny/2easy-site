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
        <div className="w-[100%] lg:w-[771px]">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
            <BreadcrumbItem>{t("header.subscription")}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex flex-col items-center">
          <h1 className={"text-primary font-bold text-3xl uppercase"}>
            {t("subscription.title")}
          </h1>
          <div className="h-3" />
          <h2 className="font-medium text-lg">
            {t("subscription.page.subtitle")}
          </h2>
          <div className="h-5" />
          <p className="text-center max-w-[750px]">
            {t("subscription.page.description1")}
            <br />
            <br />
            {t("subscription.page.description2")}{" "}
            <span className="underline">https://my.cloudpayments.ru</span>
          </p>
          <div className="h-10" />
          <div className="h-10" />

          <ContentWrapper>
            <SubscribeTariffs hideTitle />
          </ContentWrapper>
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
