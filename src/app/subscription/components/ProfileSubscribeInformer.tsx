"use client";
import { useTranslation } from "react-i18next";
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
import { useRouter } from "next/navigation";
import { useContext, useMemo, useState } from "react";

export const ProfileSubscribeInformer = () => {
  const { t } = useTranslation();
  const router = useRouter();
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
            {t("subscriptionStatus.trialUntil")}{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
          <Link
            href="/subscription"
            color="primary"
            className="underline"
            size="sm"
          >
            {t("lessons.chooseTariff")}
          </Link>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 2) {
      return (
        <>
          <p className="mb-1">
            {t("subscriptionStatus.activeUntil")}{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 3) {
      return (
        <>
          <p className="mb-1">
            {t("subscriptionStatus.activeUntil")}{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
        </>
      );
    }
    if (subscription?.subscribe_type_id === 4) {
      return (
        <>
          <p className="mb-1">
            {t("subscriptionStatus.activeUntil")}{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
        </>
      );
    }
    return (
      <div>
        <p className="font-medium">{t("subscriptionStatus.noActiveSubscription")}</p>
        <div className="h-1" />
        <p className="text-small">
          {t("subscriptionStatus.subscribeToContinue")}
        </p>
        <div className="h-3" />
        <Button
          href="/subscription"
          color="primary"
          className="w-full"
          onClick={() => {
            router.push("/subscription");
          }}
          //   size="sm"
        >
          {t("lessons.chooseTariff")}
        </Button>
      </div>
    );
  }, [router, subscription?.dateEnd, subscription?.subscribe_type_id, t]);

  return (
    <div className="w-full max-w-md min-w-0 mx-auto xl:mx-0 shrink-0">
      <Card shadow="none" className="min-w-0">
        <CardBody>
          <p>{diffText}</p>
        </CardBody>
      </Card>
    </div>
  );
};
