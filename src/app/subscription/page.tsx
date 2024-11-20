"use client";
import Link from "next/link";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { SubscribeTariffs } from "@/subscribe/components/SubscribeTariffs";
import { SubscribeFreeBlock } from "@/subscribe";
import { AuthContext } from "@/auth";
import { useContext } from "react";
import { SibscribeContext } from "@/subscribe/context";

export default function StartRegistrationPage() {
  const { isAuthorized, authIsLoading } = useContext(AuthContext);
  const { subscription } = useContext(SibscribeContext);

  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-[771px] mx-8">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem>Подписка</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex flex-col items-center">
          <h1 className={"text-primary font-bold text-3xl uppercase"}>
            подписка 2easy
          </h1>
          <div className="h-3" />
          <h2 className="font-medium text-lg">
            Доступ к материалам и платформе для создания уроков
          </h2>
          <div className="h-5" />
          <p className="text-center max-w-[750px]">
            Подписка открывает доступ к материалам и обновлениям, которые
            появляются в период действия подписки, платформе для создания уроков
            и личному кабинету с учениками для проведения уроков в real-time.
            <br />
            <br />
            Продление подписки происходит автоматически.Вы можете отменить ее в
            любое время в личном кабинете или по ссылке –{" "}
            <span className="underline">https://my.cloudpayments.ru</span>
          </p>
          <div className="h-10" />
          <div className="h-10" />
          {!isAuthorized && !authIsLoading && (
            <>
              <SubscribeFreeBlock />
              <div className="h-10" />
              <div className="h-10" />
            </>
          )}
          <h1 className={"text-primary font-bold text-3xl uppercase"}>
            {hasTariff ? "ВАШ ТАРИФ" : "тарифы 2easy"}
          </h1>
          {!hasTariff && (
            <>
              <div className="h-3" />
              <h2 className="font-medium text-lg text-center">
                Выберите тариф, чтобы оформить подписку на сайт,
                <br />
                или{" "}
                <Link href="/login">
                  <span className="text-primary underline">
                    войдите в личный кабинет
                  </span>
                </Link>
                , если у вас уже есть подписка
              </h2>
              <div className="h-10" />
            </>
          )}
          <div className="h-10" />
          <SubscribeTariffs />
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
