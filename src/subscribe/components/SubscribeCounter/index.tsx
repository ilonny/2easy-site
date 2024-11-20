"use client";
import { SibscribeContext } from "@/subscribe/context";
import { Button } from "@nextui-org/react";
import { useContext, useMemo } from "react";

export const SubscribeCounter = () => {
  const { subscription } = useContext(SibscribeContext);
  console.log("subscription", subscription);

  const diffText = useMemo(() => {
    if (subscription?.subscribe_type_id === 1) {
      return (
        <>
          <p className="mb-1">Пробный период</p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 2) {
      return (
        <>
          <p className="mb-1">Подписка на месяц</p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 3) {
      return (
        <>
          <p className="mb-1">Подписка на год</p>
        </>
      );
    }
    return <>Нет подписки</>;
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
