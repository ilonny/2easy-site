"use client";

import { Button } from "@nextui-org/react";
import {
  FC,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  itemWord,
  TMiniGameAnswerState,
  TMiniGameItem,
  TMiniGamePatch,
} from "../../../editor/MiniGame/types";
import styles from "../styles.module.css";

/** Same palette / motion feel as get-your-prize PrizeWheel */
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

const SIZE = 560;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 248;
const INNER_R = 64;
const LABEL_R = 158;
const WHEEL_SPIN_MS = 7800;

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

const splitLabel = (text: string): [string, string?] => {
  const t = String(text || "").trim();
  if (t.length <= 12) return [t];
  const mid = Math.ceil(t.length / 2);
  const space = t.lastIndexOf(" ", mid);
  if (space > 3) return [t.slice(0, space), t.slice(space + 1)];
  return [t.slice(0, mid), t.slice(mid)];
};

type TProps = {
  items: TMiniGameItem[];
  showDefinition?: boolean;
  canInteract: boolean;
  state: TMiniGameAnswerState;
  onPatch: (patch: TMiniGamePatch) => void;
};

export const SpinWheelGame: FC<TProps> = ({
  items,
  showDefinition,
  canInteract,
  state,
  onPatch,
}) => {
  const { t } = useTranslation();
  const uid = useId().replace(/:/g, "");
  const wheelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const labels = useMemo(
    () =>
      items.map((i) => ({
        id: i.id,
        text:
          showDefinition && String(i.definition || "").trim()
            ? String(i.definition)
            : itemWord(i),
      })),
    [items, showDefinition],
  );

  const n = Math.max(labels.length, 1);
  const slice = 360 / n;
  const fontSize = n > 9 ? 15 : n > 7 ? 17 : 19;

  const targetId = state.spinTargetId || state.lastSpinItemId || null;
  const targetIndex = useMemo(() => {
    if (!targetId) return null;
    const idx = labels.findIndex((l) => l.id === targetId);
    return idx >= 0 ? idx : null;
  }, [labels, targetId]);

  const spinToken = state.spinToken || 0;
  const spinDuration = state.spinDurationMs || WHEEL_SPIN_MS;
  const spinStartedAt = state.spinStartedAtMs || null;
  const [spinning, setSpinning] = useState(false);
  const lastAnimKeyRef = useRef("");

  const slices = useMemo(() => {
    const list = labels.length ? labels : [{ id: "empty", text: "—" }];
    return list.map((label, i) => {
      const start = i * slice;
      const end = (i + 1) * slice;
      const mid = start + slice / 2;
      return {
        label,
        i,
        mid,
        labelPos: polar(CX, CY, LABEL_R, mid),
        color: BRAND_SLICES[i % BRAND_SLICES.length],
        path: pieSlicePath(start, end, OUTER_R),
        lines: splitLabel(label.text),
      };
    });
  }, [labels, slice]);

  const spins = 8;
  const targetDeg =
    targetIndex == null
      ? 0
      : spins * 360 - (targetIndex * slice + slice / 2) + spinToken * 360;

  useLayoutEffect(() => {
    const node = wheelRef.current;
    if (!node) return;
    cancelAnimationFrame(rafRef.current);

    const apply = (deg: number) => {
      node.style.transform = `rotate(${deg}deg)`;
    };

    if (targetIndex == null) {
      apply(0);
      setSpinning(false);
      return;
    }

    const animKey = `${targetId}|${spinToken}|${spinStartedAt || 0}`;
    const shouldAnimate =
      !!spinStartedAt && lastAnimKeyRef.current !== animKey;

    if (!shouldAnimate) {
      apply(targetDeg % 360);
      setSpinning(false);
      return;
    }

    lastAnimKeyRef.current = animKey;
    const elapsed = Math.max(0, Date.now() - spinStartedAt);
    if (elapsed >= spinDuration) {
      apply(targetDeg);
      setSpinning(false);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(targetDeg);
      setSpinning(false);
      return;
    }

    setSpinning(true);
    const wallStart = spinStartedAt;
    const tick = () => {
      const t = Math.min(1, (Date.now() - wallStart) / spinDuration);
      apply(targetDeg * spinEase(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setSpinning(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    spinDuration,
    spinStartedAt,
    spinToken,
    targetDeg,
    targetId,
    targetIndex,
  ]);

  const result =
    targetIndex != null && labels[targetIndex]
      ? labels[targetIndex]
      : labels.find((l) => l.id === state.lastSpinItemId);

  const spin = () => {
    if (!canInteract || spinning || !labels.length) return;
    const index = Math.floor(Math.random() * labels.length);
    const picked = labels[index];
    if (!picked) return;
    const token = (state.spinToken || 0) + 1;
    const startedAt = Date.now();
    onPatch((prev) => {
      if ((prev.spinToken || 0) >= token) return prev;
      return {
        ...prev,
        activeGame: "spin-wheel",
        spinTargetId: picked.id,
        lastSpinItemId: picked.id,
        spinStartedAtMs: startedAt,
        spinDurationMs: WHEEL_SPIN_MS,
        spinToken: token,
        score: (prev.score || 0) + 1,
        total: labels.length,
        completed: false,
      };
    });
  };

  return (
    <div className={styles.wheelWrap}>
      <div className={styles.prizeWheelShell}>
        <div className={styles.prizeWheelGlow} aria-hidden />
        <div className={styles.prizeWheelShadow} aria-hidden />

        <div className={styles.prizeWheelPin} aria-hidden>
          <svg width="36" height="44" viewBox="0 0 42 52" fill="none">
            <defs>
              <linearGradient id={`${uid}-pin`} x1="21" y1="0" x2="21" y2="52">
                <stop stopColor="#6B5AD6" />
                <stop offset="0.55" stopColor="#4A38B8" />
                <stop offset="1" stopColor="#35249E" />
              </linearGradient>
              <filter
                id={`${uid}-pinSh`}
                x="-40%"
                y="-20%"
                width="180%"
                height="160%"
              >
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
          className={styles.prizeWheelRotator}
          style={{ transform: "rotate(0deg)" }}
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className={styles.prizeWheelSvg}
            role="img"
            aria-label={t("editor.miniGameSpinAria")}
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
              <filter
                id={`${uid}-inset`}
                x="-5%"
                y="-5%"
                width="110%"
                height="110%"
              >
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
                  key={s.label.id || s.i}
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
                  key={`label-${s.label.id || s.i}`}
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
                        style={{
                          fontSize: fontSize * 0.82,
                          fontWeight: 700,
                        }}
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

      <div className={styles.wheelResult}>
        {spinning ? "…" : result ? result.text : "\u00A0"}
      </div>
      <Button
        color="primary"
        isDisabled={!canInteract || spinning}
        isLoading={spinning}
        onPress={spin}
      >
        {t("editor.miniGameSpin")}
      </Button>
    </div>
  );
};
