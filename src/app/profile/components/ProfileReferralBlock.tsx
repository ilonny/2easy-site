"use client";

import { fetchGet } from "@/api";
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import { T } from "@/i18n/T";
import { Button } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";

type ReferralPayload = {
  code?: string;
  paidCount?: number;
};

export const ProfileReferralBlock = () => {
  const [data, setData] = useState<ReferralPayload | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchGet({
          path: "/referral",
          isSecure: true,
        });
        if (!res?.ok) {
          return;
        }
        const json = (await res.json()) as ReferralPayload;
        if (!cancelled && json?.code) {
          setData(json);
        }
      } catch {
        // Hide block on network / 404 — do not break profile.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onCopy = useCallback(async () => {
    if (!data?.code) {
      return;
    }
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  }, [data?.code]);

  if (!data?.code) {
    return null;
  }

  return (
    <div className="w-full min-w-0">
      <div className="rounded-[20px] bg-brand-gray p-5 lg:rounded-[30px] lg:p-6">
        <p className="mb-3 text-base font-medium">
          <T k="referral.title" defaultText="Реферальная программа" />
        </p>
        <ol className="mb-4 list-decimal space-y-1.5 pl-4 text-sm text-default-600">
          <li>
            <T
              k="referral.step1"
              defaultText="Скопируйте свой код"
            />
          </li>
          <li>
            <T
              k="referral.step2"
              defaultText="Передайте его коллеге"
            />
          </li>
          <li>
            <T
              k="referral.step3"
              defaultText="Вам — бесплатный месяц к подписке, другу — скидка 50% на первую оплату."
            />
          </li>
        </ol>
        <p className="mb-3 break-all text-center text-2xl font-semibold tracking-widest lg:text-3xl">
          {data.code}
        </p>
        <Button
          color="primary"
          className={`w-full ${brandPrimaryBtnClassName}`}
          onClick={onCopy}
        >
          {copied ? (
            <T k="referral.copied" defaultText="Скопировано" />
          ) : (
            <T k="referral.copy" defaultText="Скопировать" />
          )}
        </Button>
        <p className="mt-4 text-sm text-default-600">
          <T k="referral.paidCount" defaultText="Оплатили по вашему коду" />
          {": "}
          <span className="font-medium">{Number(data.paidCount || 0)}</span>
        </p>
      </div>
    </div>
  );
};
