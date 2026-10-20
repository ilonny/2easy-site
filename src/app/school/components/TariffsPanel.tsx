"use client";

import { Button } from "@nextui-org/react";
import { FC, useContext, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import { AuthContext } from "@/auth";
import {
  createCloudPaymentsWidget,
  loadCloudPayments,
} from "@/payment/lib/cloudpayments";
import { toast } from "react-toastify";
import { SchoolSubscription, SchoolTier } from "../types";

type TProps = {
  canPay: boolean;
  schoolId: number;
  tiers: SchoolTier[];
  subscription: SchoolSubscription;
  studentCount: number;
  createSchoolPayment: (
    schoolId: number,
    tier: string,
    email?: string,
    phone?: string,
  ) => Promise<any>;
  onPaid: () => void;
};

export const TariffsPanel: FC<TProps> = ({
  canPay,
  schoolId,
  tiers,
  subscription,
  studentCount,
  createSchoolPayment,
  onPaid,
}) => {
  const { profile } = useContext(AuthContext);
  const [payingTier, setPayingTier] = useState<string | null>(null);

  const pay = async (tier: SchoolTier) => {
    if (!canPay) return;
    setPayingTier(tier.tier);
    try {
      await loadCloudPayments();
      const response = await createSchoolPayment(
        schoolId,
        tier.tier,
        profile?.login,
        profile?.phone,
      );
      if (!response?.success) return;

      const cp = await createCloudPaymentsWidget();
      const paidAmount = Number(response.amount);
      const payerEmail = response.email || profile?.login || "";
      const payerPhone = response.paymentModel?.phone || profile?.phone || "";

      const buildReceipt = (amount: number) => {
        const amt = Math.round(Number(amount) * 100) / 100;
        return {
          Items: [
            {
              label: i18n.t("school.paymentDescription", { tier: tier.tier }),
              price: amt,
              quantity: 1,
              amount: amt,
              vat: null,
              method: 4,
              object: 4,
            },
          ],
          email: payerEmail,
          phone: payerPhone,
          isBso: false,
          amounts: {
            electronic: amt,
            advancePayment: 0,
            credit: 0,
            provision: 0,
          },
        };
      };

      // Monthly recurrent — same pattern as teacher /subscription
      const recurrentData = {
        period: 1,
        interval: "Month",
        amount: paidAmount,
        receipt: buildReceipt(paidAmount),
      };

      cp.start({
        publicId: response?.publicId,
        publicTerminalId: response?.publicId,
        description: i18n.t("school.paymentDescription", {
          tier: tier.tier,
        }),
        amount: paidAmount,
        currency: "RUB",
        email: payerEmail,
        Email: payerEmail,
        receiptEmail: payerEmail,
        emailBehavior: "Required",
        externalId: response.id.toString(),
        userInfo: {
          accountId: response.user_id,
          email: payerEmail,
          phone: payerPhone,
          name: profile?.name,
          surname: profile?.surname || "",
        },
        metadata: {
          response,
          kind: "school",
          school_id: schoolId,
          tier: tier.tier,
          type: "month",
          user_id: response.user_id,
        },
        paymentSchema: "Single",
        type: "month",
        receipt: buildReceipt(paidAmount),
        recurrent: recurrentData,
      }).then((startResult: any) => {
        if (startResult?.status === "success") {
          toast(i18n.t("school.paymentSuccess"), { type: "success" });
          onPaid();
        }
        setTimeout(() => onPaid(), 800);
      });
    } catch {
      toast(i18n.t("school.paymentError"), { type: "error" });
    } finally {
      setPayingTier(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold tracking-brand text-brand-black">
        <T k="school.tariffsTitle" />
      </h2>
      <p className="text-sm text-brand-grayFont">
        <T
          k="school.subscriptionStatus"
          values={{
            count: studentCount,
            max:
              !subscription?.max_students || subscription.max_students <= 0
                ? i18n.t("school.unlimited")
                : subscription.max_students,
            tier: subscription?.tier || "—",
            end: subscription?.dateEnd
              ? new Date(subscription.dateEnd).toLocaleDateString()
              : "—",
          }}
        />
      </p>
      {!canPay && (
        <p className="text-sm text-brand-grayFont">
          <T k="school.onlySuperAdminPays" />
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div
            key={tier.tier}
            className="flex flex-col gap-3 rounded-[16px] bg-white p-4 ring-1 ring-black/5"
          >
            <div className="text-sm font-bold text-brand-violet">
              {tier.tier}
            </div>
            <div className="text-2xl font-bold tracking-brand text-brand-black">
              {tier.amount.toLocaleString("ru-RU")} ₽
              <span className="ml-1 text-sm font-medium text-brand-grayFont">
                <T k="school.perMonth" />
              </span>
            </div>
            <div className="text-sm text-brand-grayFont">
              <T
                k="school.tierLimit"
                values={{ max: tier.maxStudents }}
              />
            </div>
            <div className="text-xs text-brand-grayFont">
              <T k="school.recurringHint" />
            </div>
            {canPay && (
              <Button
                className={brandPrimaryBtnClassName}
                isLoading={payingTier === tier.tier}
                onPress={() => pay(tier)}
              >
                <T k="school.payMonth" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
