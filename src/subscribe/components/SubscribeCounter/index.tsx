"use client";
import { SibscribeContext } from "@/subscribe/context";
import { Button } from "@nextui-org/react";
import { useContext, useMemo } from "react";
import { T } from "@/i18n/T";

export const SubscribeCounter = () => {
  const { subscription } = useContext(SibscribeContext);

  const diffText = useMemo(() => {
    if (subscription?.subscribe_type_id === 1) {
      return (
        <>
          <p className="mb-1">
            <T k="subscribe.trialPeriod" defaultText="Пробный период" />
          </p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 2) {
      return (
        <>
          <p className="mb-1">
            <T k="subscribe.monthly" defaultText="Подписка на месяц" />
          </p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 3) {
      return (
        <>
          <p className="mb-1">
            <T k="subscribe.yearly" defaultText="Подписка на год" />
          </p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 4) {
      return (
        <>
          <p className="mb-1">
            <T k="subscribe.threeMonths" defaultText="Подписка на 3 месяца" />
          </p>
        </>
      );
    }
    return <T k="subscribe.noSubscription" defaultText="Нет подписки" />;
  }, [subscription]);

  return (
    <div className="flex flex-row">
      <Button
        radius="sm"
        color={!subscription?.subscribe_type_id ? "default" : "primary"}
        style={{ pointerEvents: "none", color: "#fff" }}
      >
        {diffText}
      </Button>
    </div>
  );
};
