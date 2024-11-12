"use client";
import { SibscribeContext } from "@/subscribe/context";
// import { Button } from "@/ui/Button";
import {
  Button,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";

export const SubscribeCounter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { subscription } = useContext(SibscribeContext);
  console.log("subscription", subscription);

  const diffDate = useMemo(() => {
    if (!subscription) {
      return 0;
    }
    return dayjs(subscription?.dateEnd).diff(dayjs(), "days");
  }, [subscription]);

  const diffText = useMemo(() => {
    if (subscription?.subscribe_type_id === 1) {
      return (
        <>
          <p className="mb-1">
            Пробный период до{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
          <Link href="/subscription" color="primary" className="underline" size="sm">
            Выбрать тариф
          </Link>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 2) {
      return (
        <>
          <p className="mb-1">
            2easy PRO до {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 3) {
      return (
        <>
          <p className="mb-1">
            2easy PRO до {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
        </>
      );
    }
    return (
      <>
        Подписка закончилась
        <br />
        <Link href="/subscription" color="primary" className="underline" size="sm">
          Выбрать тариф
        </Link>
      </>
    );
  }, [subscription]);

  console.log("diffDate", diffDate);

  return (
    <div className="flex flex-row">
      <Popover
        placement="bottom-end"
        color={"default"}
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        classNames={{ content: "px-3 py-3" }}
        backdrop="opaque"
      >
        <PopoverTrigger>
          <Button radius="sm" color="primary">
            {diffDate} дней
          </Button>
        </PopoverTrigger>
        <PopoverContent>{diffText}</PopoverContent>
      </Popover>
    </div>
  );
};
