"use client";

import { useId, useLayoutEffect, useMemo, useRef } from "react";
import type { RouletteSector } from "../types";

type TProps = {
  sectors: RouletteSector[];
  targetIndex: number | null;
  animate?: boolean;
  spins?: number;
};

const SIZE = 560;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 248;
const INNER_R = 64;
const LABEL_R = 158;

/** Keep in sync with page reveal timeout */
export const WHEEL_SPIN_MS = 7800;

/**
 * Soft accelerate (~22% of time → ~14% of travel), then long ease-out
 * so the wheel crawls into the prize.
 */
const spinEase = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  const split = 0.22;
  const splitDist = 0.14;
  if (x <= split) {
    const u = x / split;
    return splitDist * u * u;
  }
  const u = (x - split) / (1 - split);
  return splitDist + (1 - splitDist) * (1 - Math.pow(1 - u, 5));
};

/** 2easy brand pastels — same toy contrast as Lavka, our palette */
const BRAND_SLICES = [
  "#C6FF75",
  "#FFA9CC",
  "#B5E8FF",
  "#C9B8FF",
  "#FFB89A",
  "#D2FF88",
  "#FF7EB3",
  "#A8D4FF",
];

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const pieSlicePath = (startDeg: number, endDeg: number, r: number) => {
  const sweep = endDeg - startDeg;
  const large = sweep > 180 ? 1 : 0;
  const a = polar(CX, CY, r, startDeg);
  const b = polar(CX, CY, r, endDeg);
  return `M ${CX} ${CY} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
};

const labelLines = (sector: RouletteSector): [string, string?] => {
  if (sector.kind === "days" && sector.days) {
    return [`+${sector.days}`, "дней"];
  }
  if (sector.percent != null) {
    const pct = `−${sector.percent}%`;
    if (sector.kind === "renew_discount") return [pct, "продление"];
    if (sector.kind === "upgrade_discount") {
      if (sector.plan === "3month") return [pct, "на 3 мес"];
      if (sector.plan === "year") return [pct, "на год"];
    }
    if (sector.plan === "month") return [pct, "на месяц"];
    if (sector.plan === "3month") return [pct, "на 3 мес"];
    if (sector.plan === "year") return [pct, "на год"];
    return [pct];
  }
  return [(sector.shortLabel || sector.label || "").replace(/\n/g, " ")];
};

export const PrizeWheel = ({
  sectors,
  targetIndex,
  animate = false,
  spins = 8,
}: TProps) => {
  const uid = useId().replace(/:/g, "");
  const wheelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const n = Math.max(sectors.length, 1);
  const slice = 360 / n;
  // SVG user units scale with the wheel; keep these large enough for ~320px phones.
  const fontSize = n > 9 ? 15 : n > 7 ? 17 : 19;

  const slices = useMemo(() => {
    const list = sectors.length
      ? sectors
      : ([{ id: "empty" }] as RouletteSector[]);

    return list.map((sector, i) => {
      const start = i * slice;
      const end = (i + 1) * slice;
      const mid = start + slice / 2;
      return {
        sector,
        i,
        mid,
        labelPos: polar(CX, CY, LABEL_R, mid),
        color: BRAND_SLICES[i % BRAND_SLICES.length],
        path: pieSlicePath(start, end, OUTER_R),
        lines: labelLines(sector),
      };
    });
  }, [sectors, slice]);

  const targetDeg =
    targetIndex == null
      ? 0
      : spins * 360 - (targetIndex * slice + slice / 2);

  useLayoutEffect(() => {
    const node = wheelRef.current;
    if (!node) return;

    cancelAnimationFrame(rafRef.current);

    const apply = (deg: number) => {
      node.style.transform = `rotate(${deg}deg)`;
    };

    if (targetIndex == null) {
      apply(0);
      return;
    }

    if (!animate) {
      apply(targetDeg);
      return;
    }

    apply(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(targetDeg);
      return;
    }

    const started = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / WHEEL_SPIN_MS);
      apply(targetDeg * spinEase(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, targetIndex, targetDeg]);

  return (
    <div className="relative mx-auto w-full max-w-[520px] select-none pt-3 sm:pt-4">
      <div
        className="pointer-events-none absolute inset-x-[8%] top-[12%] bottom-[8%] rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(90,66,212,0.35) 0%, rgba(198,255,117,0.22) 45%, transparent 70%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute left-1/2 top-[82%] z-0 h-[14%] w-[68%] -translate-x-1/2 rounded-[100%] bg-black/25 blur-[18px] sm:blur-[26px]"
        aria-hidden
      />

      <div
        className="absolute left-1/2 top-0 z-30 -translate-x-1/2 sm:top-[-4px]"
        aria-hidden
      >
        <svg
          width="36"
          height="44"
          viewBox="0 0 42 52"
          className="sm:h-[52px] sm:w-[42px]"
          fill="none"
        >
          <defs>
            <linearGradient id={`${uid}-pin`} x1="21" y1="0" x2="21" y2="52">
              <stop stopColor="#6B5AD6" />
              <stop offset="0.55" stopColor="#4A38B8" />
              <stop offset="1" stopColor="#35249E" />
            </linearGradient>
            <filter id={`${uid}-pinSh`} x="-40%" y="-20%" width="180%" height="160%">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="2.5"
                floodColor="#000"
                floodOpacity="0.28"
              />
            </filter>
          </defs>
          <path
            d="M21 50 3 4h36L21 50Z"
            fill={`url(#${uid}-pin)`}
            filter={`url(#${uid}-pinSh)`}
          />
          <ellipse cx="21" cy="7" rx="16" ry="5.5" fill="#4A38B8" />
          <ellipse cx="21" cy="5.5" rx="11" ry="3.2" fill="#8B7AD9" />
        </svg>
      </div>

      <div
        ref={wheelRef}
        className="relative z-10 aspect-square w-full will-change-transform"
        style={{
          transform: "rotate(0deg)",
          filter:
            "drop-shadow(0 12px 18px rgba(0,0,0,0.18)) drop-shadow(0 3px 6px rgba(0,0,0,0.1))",
        }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="block h-full w-full overflow-visible"
          role="img"
          aria-label="Колесо"
        >
          <defs>
            <radialGradient id={`${uid}-gloss`} cx="30%" cy="26%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="35%" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="72%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.16" />
            </radialGradient>
            <linearGradient id={`${uid}-rim`} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#6B5AD6" />
              <stop offset="35%" stopColor="#4A38B8" />
              <stop offset="70%" stopColor="#35249E" />
              <stop offset="100%" stopColor="#5A42D4" />
            </linearGradient>
            <linearGradient id={`${uid}-rimInner`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9B8CE0" />
              <stop offset="100%" stopColor="#3F28C6" />
            </linearGradient>
            <radialGradient id={`${uid}-hub`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#F1F1F4" />
              <stop offset="100%" stopColor="#D9D4F0" />
            </radialGradient>
            <filter id={`${uid}-inset`} x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="0.8"
                floodColor="#000"
                floodOpacity="0.12"
              />
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={OUTER_R + 18} fill={`url(#${uid}-rim)`} />
          <circle
            cx={CX}
            cy={CY}
            r={OUTER_R + 12}
            fill={`url(#${uid}-rimInner)`}
          />
          <circle cx={CX} cy={CY} r={OUTER_R + 5} fill="#181818" />

          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * 360;
            const p = polar(CX, CY, OUTER_R + 12, a);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={2.4}
                fill={i % 2 === 0 ? "#C4BCE8" : "#35249E"}
              />
            );
          })}

          <g filter={`url(#${uid}-inset)`}>
            {slices.map((s) => (
              <path
                key={s.sector.id || s.i}
                d={s.path}
                fill={s.color}
                stroke="rgba(0,0,0,0.08)"
                strokeWidth={1}
              />
            ))}
          </g>

          <circle
            cx={CX}
            cy={CY}
            r={OUTER_R}
            fill={`url(#${uid}-gloss)`}
            style={{ pointerEvents: "none" }}
          />

          {slices.map((s) => {
            const [line1, line2] = s.lines;
            return (
              <text
                key={`label-${s.sector.id || s.i}`}
                x={s.labelPos.x}
                y={s.labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#181818"
                style={{
                  fontSize,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  fontFamily: "Manrope, system-ui, sans-serif",
                }}
              >
                {line2 ? (
                  <>
                    <tspan x={s.labelPos.x} dy="-0.55em">
                      {line1}
                    </tspan>
                    <tspan
                      x={s.labelPos.x}
                      dy="1.2em"
                      style={{ fontSize: fontSize * 0.82, fontWeight: 700 }}
                    >
                      {line2}
                    </tspan>
                  </>
                ) : (
                  line1
                )}
              </text>
            );
          })}

          <circle cx={CX} cy={CY} r={INNER_R + 6} fill="rgba(0,0,0,0.12)" />
          <circle cx={CX} cy={CY} r={INNER_R} fill={`url(#${uid}-hub)`} />
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R - 3}
            fill="none"
            stroke="#4A38B8"
            strokeWidth={3}
          />
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R - 10}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={2}
          />
          <text
            x={CX}
            y={CY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#5A42D4"
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              fontFamily: "Manrope, system-ui, sans-serif",
            }}
          >
            2EASY
          </text>
        </svg>
      </div>
    </div>
  );
};
