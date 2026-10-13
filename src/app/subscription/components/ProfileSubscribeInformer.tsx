"use client";

import { SibscribeContext } from "@/subscribe/context";
import { Button, Link } from "@nextui-org/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useMemo } from "react";
import { T } from "@/i18n/T";
import { brandPrimaryBtnClassName } from "@/components/brandUi";

export const ProfileSubscribeInformer = () => {
  const router = useRouter();
  const { subscription } = useContext(SibscribeContext);
  const diffText = useMemo(() => {
    if (subscription?.subscribe_type_id === 1) {
      return (
        <>
          <p className="mb-1 text-sm font-bold tracking-brand text-brand-black">
            <T k="subscriptionStatus.trialUntil" />{" "}
            {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
          </p>
          <Link
            href="/subscription"
            className="text-sm font-bold tracking-brand text-brand-violet underline"
            size="sm"
          >
            <T k="lessons.chooseTariff" />
          </Link>
        </>
      );
    }
    if (
      subscription?.subscribe_type_id === 2 ||
      subscription?.subscribe_type_id === 3 ||
      subscription?.subscribe_type_id === 4
    ) {
      return (
        <p className="mb-1 text-sm font-bold tracking-brand text-brand-black">
          <T k="subscriptionStatus.activeUntil" />{" "}
          {dayjs(subscription?.dateEnd)?.format("DD.MM.YYYY")}
        </p>
      );
    }
    return (
      <div>
        <p className="font-bold tracking-brand text-brand-black">
          <T k="subscriptionStatus.noActiveSubscription" />
        </p>
        <div className="h-1" />
        <p className="text-sm font-bold tracking-brand text-brand-grayFont">
          <T k="subscriptionStatus.subscribeToContinue" />
        </p>
        <div className="h-3" />
        <Button
          className={`w-full ${brandPrimaryBtnClassName}`}
          onClick={() => {
            router.push("/subscription");
          }}
        >
          <T k="lessons.chooseTariff" />
        </Button>
      </div>
    );
  }, [router, subscription?.dateEnd, subscription?.subscribe_type_id]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-md shrink-0 xl:mx-0">
      <div className="rounded-[20px] bg-brand-gray p-5 lg:rounded-[30px] lg:p-6">
        {diffText}
      </div>
    </div>
  );
};
