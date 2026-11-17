"use client";

import { AuthContext } from "@/auth";
import { landingContainerClassName } from "@/constants/layout";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { SibscribeContext } from "@/subscribe/context";
import { TSubscribePeriod } from "@/subscribe/types";
import { toast } from "react-toastify";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthGateModal } from "./components/AuthGateModal";
import { PrizeApplyModal } from "./components/PrizeApplyModal";
import { PrizeWheel, WHEEL_SPIN_MS } from "./components/PrizeWheel";
import { StickerBurst } from "./components/StickerBurst";
import { useRoulette } from "./hooks/useRoulette";
import type { PrizeKind } from "./types";

type PrizeCard = {
  tint: string;
  title: string;
  desc: string;
};

const STEPS_BY_SEGMENT: Record<"guest" | "A" | "B" | "C" | "D", string[]> = {
  guest: [
    "getYourPrize.stepGuest1",
    "getYourPrize.stepGuest2",
    "getYourPrize.stepGuest3",
  ],
  A: [
    "getYourPrize.stepA1",
    "getYourPrize.stepA2",
    "getYourPrize.stepA3",
  ],
  B: [
    "getYourPrize.stepPaid1",
    "getYourPrize.stepPaid2",
    "getYourPrize.stepPaid3",
  ],
  C: [
    "getYourPrize.stepPaid1",
    "getYourPrize.stepPaid2",
    "getYourPrize.stepPaid3",
  ],
  D: [
    "getYourPrize.stepPaid1",
    "getYourPrize.stepPaid2",
    "getYourPrize.stepPaid3",
  ],
};

const CARDS_BY_SEGMENT: Record<"guest" | "A" | "B" | "C" | "D", PrizeCard[]> = {
  guest: [
    {
      tint: "bg-[#D2FF88]",
      title: "getYourPrize.cardDiscountMonthTitle",
      desc: "getYourPrize.cardDiscountMonthDesc",
    },
    {
      tint: "bg-[#FFA9CC]",
      title: "getYourPrize.cardDiscountQuarterTitle",
      desc: "getYourPrize.cardDiscountQuarterDesc",
    },
    {
      tint: "bg-[#B5E8FF]",
      title: "getYourPrize.cardDiscountYearTitle",
      desc: "getYourPrize.cardDiscountYearDesc",
    },
  ],
  A: [
    {
      tint: "bg-[#D2FF88]",
      title: "getYourPrize.cardDiscountMonthTitle",
      desc: "getYourPrize.cardDiscountMonthDesc",
    },
    {
      tint: "bg-[#FFA9CC]",
      title: "getYourPrize.cardDiscountQuarterTitle",
      desc: "getYourPrize.cardDiscountQuarterDesc",
    },
    {
      tint: "bg-[#B5E8FF]",
      title: "getYourPrize.cardDiscountYearTitle",
      desc: "getYourPrize.cardDiscountYearDesc",
    },
  ],
  B: [
    {
      tint: "bg-[#D2FF88]",
      title: "getYourPrize.cardDaysTitle",
      desc: "getYourPrize.cardDaysDesc",
    },
    {
      tint: "bg-[#FFA9CC]",
      title: "getYourPrize.cardUpgradeQuarterTitle",
      desc: "getYourPrize.cardUpgradeQuarterDesc",
    },
    {
      tint: "bg-[#B5E8FF]",
      title: "getYourPrize.cardUpgradeYearTitle",
      desc: "getYourPrize.cardUpgradeYearDesc",
    },
  ],
  C: [
    {
      tint: "bg-[#D2FF88]",
      title: "getYourPrize.cardDaysTitle",
      desc: "getYourPrize.cardDaysDesc",
    },
    {
      tint: "bg-[#B5E8FF]",
      title: "getYourPrize.cardUpgradeYearTitle",
      desc: "getYourPrize.cardUpgradeYearFromQuarterDesc",
    },
  ],
  D: [
    {
      tint: "bg-[#D2FF88]",
      title: "getYourPrize.cardDaysTitle",
      desc: "getYourPrize.cardDaysDesc",
    },
    {
      tint: "bg-[#E8D5FF]",
      title: "getYourPrize.cardRenewTitle",
      desc: "getYourPrize.cardRenewDesc",
    },
  ],
};

const SUBTITLE_BY_SEGMENT: Record<"guest" | "A" | "B" | "C" | "D", string> = {
  guest: "getYourPrize.subtitleGuest",
  A: "getYourPrize.subtitleA",
  B: "getYourPrize.subtitleB",
  C: "getYourPrize.subtitleC",
  D: "getYourPrize.subtitleD",
};

const PRIZES_SUBTITLE_BY_SEGMENT: Record<
  "guest" | "A" | "B" | "C" | "D",
  string
> = {
  guest: "getYourPrize.prizesSubtitleGuest",
  A: "getYourPrize.prizesSubtitleA",
  B: "getYourPrize.prizesSubtitleB",
  C: "getYourPrize.prizesSubtitleC",
  D: "getYourPrize.prizesSubtitleD",
};

export default function GetYourPrizePage() {
  const { isAuthorized, authIsLoading } = useContext(AuthContext);
  const { getSubscribe } = useContext(SibscribeContext) as {
    getSubscribe?: () => Promise<void>;
  };
  const authorized = Boolean(isAuthorized);

  const {
    loading,
    spinning,
    applying,
    canSpin,
    segment,
    sectors,
    spin,
    sectorIndex,
    setSectorIndex,
    unusedDays,
    spinWheel,
    applyPrize,
    reload,
  } = useRoulette(authorized, !authIsLoading);

  const [authOpen, setAuthOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [wheelTarget, setWheelTarget] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [checkout, setCheckout] = useState<{
    plan: TSubscribePeriod;
    promocode: string;
    mode: "discount" | "upgrade_discount" | "renew_discount";
    unusedDays: number;
  } | null>(null);
  const revealTimer = useRef(0);
  const wheelSectionRef = useRef<HTMLElement>(null);
  const restoredWheelRef = useRef(false);

  const contentKey = useMemo<"guest" | "A" | "B" | "C" | "D">(() => {
    if (!authorized) return "guest";
    if (segment === "B" || segment === "C" || segment === "D") return segment;
    return "A";
  }, [authorized, segment]);

  const steps = STEPS_BY_SEGMENT[contentKey];
  const prizeCards = CARDS_BY_SEGMENT[contentKey];

  // Park wheel on already-won sector after status load (no animation).
  useEffect(() => {
    if (restoredWheelRef.current || loading) return;
    if (spin && sectorIndex != null) {
      setWheelTarget(sectorIndex);
    }
    restoredWheelRef.current = true;
  }, [loading, spin, sectorIndex]);

  useEffect(() => {
    return () => window.clearTimeout(revealTimer.current);
  }, []);

  const scrollToWheel = () => {
    wheelSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const onSpinClick = async () => {
    if (!authorized) {
      setAuthOpen(true);
      return;
    }
    if (spinning || animating) return;

    if (!canSpin || Boolean(spin)) {
      toast.info(i18n.t("getYourPrize.alreadySpun"));
      return;
    }

    const result = await spinWheel();
    if (!result) {
      toast.info(i18n.t("getYourPrize.alreadySpun"));
      return;
    }

    restoredWheelRef.current = true;
    window.clearTimeout(revealTimer.current);
    setSectorIndex(result.sectorIndex);

    // Reset to 0° without transition, paint, then spin to target.
    setAnimating(false);
    setWheelTarget(null);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    setAnimating(true);
    setWheelTarget(result.sectorIndex);

    revealTimer.current = window.setTimeout(() => {
      setAnimating(false);
      setBurst((n) => n + 1);
    }, WHEEL_SPIN_MS + 120);
  };

  const onApplyClick = async () => {
    if (!spin?.prize) return;
    const kind = spin.prize.kind as PrizeKind;

    const data = await applyPrize();
    if (!data) {
      toast.error("Не удалось применить подарок");
      return;
    }

    if (kind === "days") {
      toast.success(
        data.dateEnd
          ? `Подписка продлена до ${new Date(data.dateEnd).toLocaleDateString("ru-RU")}`
          : "Дни добавлены к подписке",
      );
      void getSubscribe?.();
      void reload();
      setBurst((n) => n + 1);
      return;
    }

    const plan = (data.plan || spin.prize.plan) as TSubscribePeriod | null;
    const promocode = data.promocode || spin.promocode;
    if (!plan || !promocode) {
      toast.error("Промокод недоступен");
      return;
    }

    setCheckout({
      plan,
      promocode,
      mode: kind as "discount" | "upgrade_discount" | "renew_discount",
      unusedDays: data.unusedDays ?? unusedDays,
    });
  };

  const alreadySpun = Boolean(spin) && !canSpin;
  const showResult = alreadySpun && !animating && spin?.prize;

  return (
    <div className="relative z-[2] overflow-x-clip rounded-b-[40px] bg-white pb-16 lg:rounded-b-[60px] lg:pb-[120px]">
      <StickerBurst trigger={burst} />

      <section className="relative overflow-hidden border-b border-black/[0.04]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 42%, rgba(210,255,136,0.55) 0%, transparent 62%), radial-gradient(ellipse 55% 55% at 92% 58%, rgba(181,232,255,0.5) 0%, transparent 58%), radial-gradient(ellipse 50% 50% at 8% 52%, rgba(255,169,204,0.48) 0%, transparent 58%)",
          }}
        />
        <div
          className={`${landingContainerClassName} relative flex flex-col items-center gap-4 py-14 text-center lg:gap-5 lg:py-20`}
        >
          <h1 className="max-w-[720px] text-[28px] font-bold leading-[1.1] tracking-brand text-brand-black sm:text-[34px] lg:text-[44px]">
            <T k="getYourPrize.title" />
          </h1>
          <p className="max-w-[520px] text-[15px] font-medium leading-snug text-brand-black/70 lg:text-lg">
            <T k={SUBTITLE_BY_SEGMENT[contentKey]} />
          </p>
          <button
            type="button"
            onClick={scrollToWheel}
            className="mt-1 h-12 rounded-[14px] bg-brand-violet px-6 text-sm font-bold text-white hover:opacity-90 lg:h-[52px] lg:text-base"
          >
            <T k="getYourPrize.scrollToWheel" />
          </button>
        </div>
      </section>

      <section className={`${landingContainerClassName} py-12 lg:py-16`}>
        <h2 className="mb-7 text-center text-[24px] font-bold tracking-brand text-brand-black lg:mb-9 lg:text-[36px]">
          <T k="getYourPrize.howTitle" />
        </h2>
        <div
          className={`mx-auto grid max-w-[1040px] gap-4 ${
            steps.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {steps.map((key, i) => (
            <div key={key} className="rounded-[20px] bg-[#F5F5F7] p-5 lg:p-6">
              <span className="mb-3 inline-flex size-9 items-center justify-center rounded-[10px] bg-brand-violet text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-[15px] font-medium leading-snug text-brand-black lg:text-base">
                <T k={key} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${landingContainerClassName} pb-10 lg:pb-14`}>
        <h2 className="mb-3 text-center text-[24px] font-bold tracking-brand text-brand-black lg:text-[36px]">
          <T k="getYourPrize.prizesTitle" />
        </h2>
        <p className="mx-auto mb-8 max-w-[560px] text-center text-[15px] font-medium leading-snug text-brand-black/65 lg:mb-10 lg:text-base">
          <T k={PRIZES_SUBTITLE_BY_SEGMENT[contentKey]} />
        </p>
        <div
          className={`mx-auto grid max-w-[1040px] gap-4 ${
            prizeCards.length >= 3
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2"
          }`}
        >
          {prizeCards.map((card) => (
            <div
              key={card.title}
              className="overflow-hidden rounded-[20px] border border-black/[0.05] bg-white shadow-[0_6px_20px_rgba(24,24,24,0.05)]"
            >
              <div className={`h-2.5 w-full ${card.tint}`} />
              <div className="space-y-1.5 p-4 lg:p-5">
                <p className="text-[15px] font-bold tracking-brand text-brand-black">
                  <T k={card.title} />
                </p>
                <p className="text-sm font-medium leading-snug text-brand-black/60">
                  <T k={card.desc} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={wheelSectionRef}
        id="roulette"
        className={`${landingContainerClassName} scroll-mt-24 pb-6 pt-4 sm:scroll-mt-28 lg:pt-8`}
      >
        <div
          className="mx-auto flex w-full max-w-[680px] flex-col items-center gap-5 overflow-x-clip rounded-[28px] px-4 py-8 sm:gap-6 sm:rounded-[32px] sm:px-6 sm:py-10 lg:gap-8 lg:px-8 lg:py-12"
          style={{
            background:
              "linear-gradient(180deg, #C9BBFF 0%, #F1EDFF 100%)",
            boxShadow:
              "0 20px 50px rgba(90,66,212,0.18), inset 0 1px 0 rgba(255,255,255,0.55)",
          }}
        >
          <h2 className="px-2 text-center text-[22px] font-extrabold tracking-brand text-brand-black sm:text-[24px] lg:text-[32px]">
            <T k="getYourPrize.wheelTitle" />
          </h2>

          <div className="w-full max-w-full">
            {loading && !sectors.length ? (
              <div className="mx-auto aspect-square w-full max-w-[520px] animate-pulse rounded-full bg-white/70" />
            ) : (
              <PrizeWheel
                sectors={sectors}
                targetIndex={wheelTarget}
                animate={animating}
                spins={8}
              />
            )}
          </div>

          {!showResult ? (
            <button
              type="button"
              onClick={() => void onSpinClick()}
              disabled={spinning || animating}
              className="h-14 w-full max-w-[280px] touch-manipulation rounded-full bg-brand-violet px-8 text-base font-extrabold tracking-brand text-white shadow-[0_12px_28px_rgba(90,66,212,0.35)] hover:opacity-90 disabled:pointer-events-none disabled:opacity-45 sm:h-[56px] sm:w-auto sm:min-w-[220px] sm:px-10"
            >
              {!authorized ? (
                <T k="getYourPrize.spinAuthCta" />
              ) : spinning || animating ? (
                <T k="getYourPrize.spinning" />
              ) : (
                <T k="getYourPrize.spinCta" />
              )}
            </button>
          ) : null}

          {showResult ? (
            <div className="flex w-full max-w-[400px] flex-col items-center gap-3 rounded-[20px] bg-white p-4 text-center shadow-[0_10px_30px_rgba(24,24,24,0.08)] sm:p-5">
              <p className="text-sm font-bold text-brand-violet">
                <T k="getYourPrize.youWon" />
              </p>
              <p className="text-[20px] font-bold leading-tight tracking-brand text-brand-black sm:text-[22px] lg:text-[26px]">
                {spin?.prize?.label}
              </p>
              {spin?.prize?.kind === "discount" ? (
                <p className="text-sm font-medium text-brand-black/65">
                  <T k="getYourPrize.firstPurchaseHint" />
                </p>
              ) : null}
              {spin?.promocode ? (
                <p className="max-w-full break-all rounded-[10px] bg-[#F5F5F7] px-3 py-2 font-mono text-sm font-bold">
                  {spin.promocode}
                </p>
              ) : null}
              {spin?.status === "applied" && spin.prizeKind === "days" ? (
                <p className="text-sm font-medium text-brand-black/55">
                  <T k="getYourPrize.alreadyApplied" />
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void onApplyClick()}
                  disabled={applying || spin?.status === "applied"}
                  className="mt-1 h-12 w-full touch-manipulation rounded-[14px] bg-brand-violet text-sm font-bold text-white disabled:opacity-50"
                >
                  <T k="getYourPrize.applyCta" />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <AuthGateModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={() => {
          setAuthOpen(false);
          void reload();
          requestAnimationFrame(scrollToWheel);
        }}
      />

      {checkout ? (
        <PrizeApplyModal
          open
          onClose={() => {
            setCheckout(null);
            void reload();
            void getSubscribe?.();
          }}
          plan={checkout.plan}
          promocode={checkout.promocode}
          mode={checkout.mode}
          unusedDays={checkout.unusedDays}
        />
      ) : null}
    </div>
  );
}
