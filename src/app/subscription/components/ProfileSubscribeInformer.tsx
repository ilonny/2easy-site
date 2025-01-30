"use client";
import { SibscribeContext } from "@/subscribe/context";
// import { Button } from "@/ui/Button";
import {
  Button,
  Card,
  CardBody,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";

export const ProfileSubscribeInformer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { subscription } = useContext(SibscribeContext);

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
          <Link
            href="/subscription"
            color="primary"
            className="underline"
            size="sm"
          >
            Выбрать тариф
          </Link>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 2) {
      return (
        <>
          <p className="mb-1">
            Подписка 2easy до{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 3) {
      return (
        <>
          <p className="mb-1">
            Подписка 2easy до{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
        </>
      );
    }
    return (
      <div>
        <p className="font-medium">Нет активных подписок</p>
        <div className="h-1" />
        <p className="text-small">
          Оформите подписку, чтобы продолжить пользоваться сайтом
        </p>
        <div className="h-3" />
        <Button
          href="/subscription"
          color="primary"
          className="w-full"
          //   size="sm"
        >
          Выбрать тариф
        </Button>
      </div>
    );
  }, [subscription]);

  return (
    <div>
      <Card shadow="none">
        <CardBody>
          <p>{diffText}</p>
          {!!subscription?.subscribe_type_id && (
            <Link
              size="sm"
              className="cursor-pointer text-small"
              color="danger"
            >
              <p className="underline">Отменить подписку</p>
            </Link>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
