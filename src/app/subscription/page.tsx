"use client";

import { CatalogPageShell } from "@/components";
import { MainTariffs } from "@/components/MainTariffs";
import { AuthContext } from "@/auth";
import { useContext } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { SubscribeCancel } from "@/subscribe/components/SubscribeCancel";
import { T } from "@/i18n/T";

export default function SubscriptionPage() {
  const { isAuthorized } = useContext(AuthContext);
  const { subscription } = useContext(SibscribeContext);

  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  return (
    <CatalogPageShell
      title={<T k="subscription.title" />}
      subtitle={
        <>
          <T k="subscription.page.subtitle" />
          <br />
          <br />
          <span className="font-bold text-brand-grayFont">
            <T k="subscription.page.description1" />
            <br />
            <br />
            <T k="subscription.page.description2" />
          </span>
        </>
      }
    >
      <MainTariffs embedded hideTitle />
      {isAuthorized && hasTariff ? (
        <div className="flex justify-center">
          <SubscribeCancel />
        </div>
      ) : null}
    </CatalogPageShell>
  );
}
