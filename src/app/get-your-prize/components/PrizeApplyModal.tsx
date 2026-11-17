"use client";

import { PaymentForm } from "@/payment";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";
import { T } from "@/i18n/T";
import { TSubscribePeriod } from "@/subscribe/types";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";

type TProps = {
  open: boolean;
  onClose: () => void;
  plan: TSubscribePeriod;
  promocode: string;
  mode: "discount" | "upgrade_discount" | "renew_discount";
  unusedDays?: number;
};

export const PrizeApplyModal = ({
  open,
  onClose,
  plan,
  promocode,
  mode,
  unusedDays = 0,
}: TProps) => {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="2xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS,
        base: "mx-3 max-h-[min(92dvh,880px)] w-full sm:mx-auto",
        body: "max-h-[min(70dvh,640px)] overflow-y-auto overscroll-contain",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span className="text-xl font-bold tracking-brand">
            {mode === "upgrade_discount" ? (
              <T k="getYourPrize.upgradeTitle" />
            ) : mode === "renew_discount" ? (
              <T k="getYourPrize.renewTitle" />
            ) : (
              <T k="getYourPrize.checkoutTitle" />
            )}
          </span>
          {mode === "upgrade_discount" && unusedDays > 0 ? (
            <p className="text-sm font-medium text-brand-black/70">
              <T
                k="getYourPrize.unusedDaysHint"
                values={{ days: unusedDays }}
              />
            </p>
          ) : null}
          {mode === "discount" ? (
            <p className="text-sm font-medium text-brand-black/70">
              <T k="getYourPrize.firstPurchaseHint" />
            </p>
          ) : null}
        </ModalHeader>
        <ModalBody className="pb-6">
          <PaymentForm type={plan} initialPromocode={promocode} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
