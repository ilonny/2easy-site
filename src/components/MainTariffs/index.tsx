"use client";

import { ReactNode, useContext, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { T } from "@/i18n/T";
import { useUserAccess } from "@/app/subscription/helpers";
import { landingContainerClassName } from "@/constants/layout";
import { PaymentForm } from "@/payment";
import { StickerRain } from "@/components/StickerRain";
import { SibscribeContext } from "@/subscribe/context";
import { tariffs } from "@/subscribe/components/SubscribeTariffs/tariffs";
import { TSubscribePeriod } from "@/subscribe/types";
import TickIcon from "@/assets/icons/tick_box_violet.svg";
import LockIcon from "@/assets/icons/lock_gray.svg";
import TariffBg from "@/assets/images/tariffs/bg.jpg";
import PetCat from "@/assets/images/tariffs/pet_cat.png";
import PetDog from "@/assets/images/tariffs/pet_dog.png";
import PetChihuahua from "@/assets/images/tariffs/pet_chihuahua.png";

type TPeriod = {
  type: TSubscribePeriod;
  labelKey: string;
  months: number;
  badgeClassName?: string;
  payForKey?: string;
  pet: StaticImageData;
  petClassName: string;
};

const periods: TPeriod[] = [
  {
    type: "month",
    labelKey: "tariffs.tabMonth",
    months: 1,
    pet: PetCat,
    petClassName:
      "left-[195px] top-[-40px] w-[97px] lg:left-[248px] lg:top-[-50px] lg:w-[126px]",
  },
  {
    type: "3month",
    labelKey: "tariffs.tab3Months",
    months: 3,
    badgeClassName: "bg-brand-orange",
    payForKey: "tariffs.payFor3Months",
    pet: PetDog,
    petClassName:
      "left-[168px] top-[-46px] w-[143px] lg:left-[213px] lg:top-[-57px] lg:w-[187px]",
  },
  {
    type: "year",
    labelKey: "tariffs.tabYear",
    months: 12,
    badgeClassName: "bg-brand-violet",
    payForKey: "tariffs.payForYear",
    pet: PetChihuahua,
    petClassName:
      "left-[202px] top-[-47px] w-[83px] lg:left-[257px] lg:top-[-59px] lg:w-[109px]",
  },
];

const trialFeatures = [
  { key: "tariffs.featureConstructor" },
  { key: "tariffs.featureTrialLessons" },
  { key: "tariffs.featureGames" },
  { key: "tariffs.featureCards" },
  { key: "tariffs.featureGrammar" },
  { key: "tariffs.featureNew", locked: true },
];

const fullFeatures = [
  { key: "tariffs.featureConstructor" },
  { key: "tariffs.featureFullLessons" },
  { key: "tariffs.featureGames" },
  { key: "tariffs.featureCards" },
  { key: "tariffs.featureGrammar" },
  { key: "tariffs.featureNew" },
];

const trialTags = [
  { key: "content.tagFree", className: "bg-[#F0EDFD] text-brand-violet" },
  { key: "content.tagDays", className: "bg-[#E9FFCA] text-[#5F8E1C]" },
  { key: "tariffs.tagNoCard", className: "bg-[#DFEDFF] text-[#1E79EE]" },
];

const getDiscount = (price: number, oldPrice?: number) =>
  oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

const buttonClassName =
  "flex h-[45px] w-full items-center justify-center rounded-[14px] bg-brand-violet px-2.5 text-xs font-bold leading-none tracking-brand text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 lg:text-sm";

const FeatureList = ({ features }: { features: { key: string; locked?: boolean }[] }) => (
  <div className="flex flex-col gap-3 lg:gap-3.5">
    {features.map((feature) => (
      <div
        key={feature.key}
        className="flex items-center gap-[5px] text-sm font-bold leading-[1.3] tracking-brand lg:gap-2.5 lg:text-base lg:leading-[1.3]"
      >
        <Image
          src={feature.locked ? LockIcon : TickIcon}
          alt=""
          className="size-4 shrink-0 p-px"
        />
        <T
          k={feature.key}
          className={feature.locked ? "text-[#9F9FA1]" : "text-brand-black"}
        />
      </div>
    ))}
  </div>
);

type TCardProps = {
  titleKey: string;
  isFull?: boolean;
  pet?: TPeriod;
  children: ReactNode;
  footer: ReactNode;
};

const TariffCard = ({ titleKey, isFull, pet, children, footer }: TCardProps) => (
  <div
    className={`relative flex flex-col gap-2.5 rounded-[20px] px-2.5 pb-2.5 pt-[15px] md:h-[455px] lg:h-[540px] lg:gap-5 lg:rounded-[30px] lg:pt-5 ${
      isFull ? "" : "overflow-hidden bg-brand-gray"
    }`}
  >
    {isFull && (
      <Image
        src={TariffBg}
        alt=""
        fill
        sizes="(min-width: 1024px) 427px, (min-width: 768px) 380px, 100vw"
        className="rounded-[20px] object-cover lg:rounded-[30px]"
      />
    )}
    {pet && (
      <Image
        key={pet.type}
        src={pet.pet}
        alt=""
        className={`pointer-events-none absolute h-auto ${pet.petClassName}`}
      />
    )}
    <T
      k={titleKey}
      as="p"
      className={`relative px-2.5 text-base font-bold leading-[1.2] tracking-brand lg:px-6 lg:text-[22px] lg:leading-[1.2] ${
        isFull ? "text-white" : "text-brand-black"
      }`}
    />
    <div className="relative flex flex-1 flex-col justify-between gap-[30px] rounded-2xl bg-white p-[15px] lg:rounded-3xl lg:p-6">
      <div className="flex flex-col gap-[30px] lg:gap-10">{children}</div>
      {footer}
    </div>
  </div>
);

export const MainTariffs = () => {
  const access = useUserAccess();
  const { subscription } = useContext(SibscribeContext) as {
    subscription?: { success?: boolean; subscribe_type_id?: number } | null;
  };
  const [periodType, setPeriodType] = useState<TSubscribePeriod>("month");
  const [paymentOpened, setPaymentOpened] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  if (access === "student") return null;

  const period = periods.find((p) => p.type === periodType) ?? periods[0];
  const tariff = tariffs.find((t) => t.type === periodType) ?? tariffs[0];
  const perMonth = Math.round(tariff.price / period.months);
  const discount = getDiscount(tariff.price, tariff.oldPrice);
  const isTrial = subscription?.success && subscription?.subscribe_type_id === 1;
  const isPaid = subscription?.success && subscription?.subscribe_type_id !== 1;

  const onPay = () => {
    setPaymentOpened(true);
    (window as unknown as { ym?: (...args: unknown[]) => void }).ym?.(
      103955671,
      "reachGoal",
      "open-subscribe-modal",
    );
  };

  const payLabel = <T k="tariffs.pay" values={{ price: tariff.price }} />;

  return (
    <section
      ref={sectionRef}
      id="tariffs"
      className={`${landingContainerClassName} flex flex-col gap-[30px] lg:gap-[50px]`}
    >
      <StickerRain targetRef={sectionRef} />
      <h2 className="mx-auto max-w-[460px] text-center text-[25px] font-bold leading-none tracking-brand text-brand-black lg:max-w-[550px] lg:text-[40px]">
        <T k="tariffs.title" />
      </h2>
      <div className="flex flex-col items-center gap-[30px] lg:gap-10">
        <div className="flex gap-1 rounded-[10px] bg-brand-gray p-2 lg:rounded-[20px]">
          {periods.map((item) => {
            const itemTariff = tariffs.find((t) => t.type === item.type);
            const itemDiscount = getDiscount(
              itemTariff?.price ?? 0,
              itemTariff?.oldPrice,
            );
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setPeriodType(item.type)}
                className={`flex h-[38px] items-center gap-[5px] whitespace-nowrap rounded-lg px-2.5 text-xs font-bold leading-none tracking-brand text-brand-black transition-colors lg:gap-2.5 lg:rounded-xl lg:text-sm ${
                  item.type === periodType ? "bg-white" : "hover:bg-white/60"
                }`}
              >
                <T k={item.labelKey} />
                {itemDiscount > 0 && (
                  <span
                    className={`flex h-[22px] items-center rounded-md px-1 text-[10px] text-white lg:rounded-lg lg:text-xs ${item.badgeClassName}`}
                  >
                    -{itemDiscount}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex w-full flex-col-reverse gap-5 md:grid md:grid-cols-2 lg:grid-cols-[repeat(2,427px)] lg:justify-center">
          <TariffCard
            titleKey="tariffs.trialTitle"
            footer={
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-wrap gap-x-[5px] gap-y-[3px]">
                  {trialTags.map((tag) => (
                    <T
                      key={tag.key}
                      k={tag.key}
                      className={`whitespace-nowrap rounded-[7px] px-2 py-[5px] text-[10px] font-bold leading-[14px] tracking-brand lg:text-xs lg:leading-4 ${tag.className}`}
                    />
                  ))}
                </div>
                {access === "guest" && (
                  <Link href="/registration" className={buttonClassName}>
                    <T k="header.tryFree" />
                  </Link>
                )}
                {isTrial && (
                  <button type="button" disabled className={buttonClassName}>
                    <T k="tariffs.current" />
                  </button>
                )}
              </div>
            }
          >
            <FeatureList features={trialFeatures} />
            <T
              k="tariffs.trialPrice"
              as="p"
              className="text-xl font-bold leading-[1.09] tracking-brand text-brand-black lg:text-[22px] lg:leading-[1.2]"
            />
          </TariffCard>
          <TariffCard
            titleKey="tariffs.fullTitle"
            isFull
            pet={period}
            footer={
              access === "guest" ? (
                <Link href="/registration" className={buttonClassName}>
                  {payLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={access === "loading" || Boolean(isPaid)}
                  onClick={onPay}
                  className={buttonClassName}
                >
                  {isPaid ? <T k="tariffs.active" /> : payLabel}
                </button>
              )
            }
          >
            <FeatureList features={fullFeatures} />
            <div className="flex flex-col gap-1.5 font-bold tracking-brand">
              <div className="flex items-center gap-2.5">
                <T
                  k="tariffs.perMonth"
                  values={{ price: perMonth }}
                  as="p"
                  className="text-xl leading-[1.09] text-brand-black lg:text-[22px] lg:leading-[1.2]"
                />
                {discount > 0 && (
                  <span className="rounded-[7px] bg-brand-orange px-1 py-[3px] text-[10px] leading-[14px] text-white lg:text-xs lg:leading-4">
                    -{discount}%
                  </span>
                )}
              </div>
              {tariff.oldPrice && period.payForKey && (
                <p className="flex flex-wrap gap-[3px] text-xs lg:text-sm">
                  <s className="text-brand-violet">{tariff.oldPrice} ₽</s>
                  <T
                    k={period.payForKey}
                    values={{ price: tariff.price }}
                    className="text-brand-orange"
                  />
                </p>
              )}
            </div>
          </TariffCard>
        </div>
      </div>
      <Modal
        size="lg"
        isOpen={paymentOpened}
        onClose={() => setPaymentOpened(false)}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <PaymentForm type={periodType} />
            <div className="h-10" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  );
};
