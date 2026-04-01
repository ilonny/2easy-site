"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Card,
  Chip,
  Input,
  Select,
  SelectItem,
  Tooltip,
} from "@nextui-org/react";
import { FC, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { AuthContext } from "@/auth";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import {
  TFillGapsNewData,
  TFillGapsNewGap,
  TFillGapsNewMode,
  TSlateGapElement,
  TSlateParagraphElement,
  TSlateText,
} from "../../editor/FillGapsNew/types";
import styles from "./styles.module.css";

type TAnswerStatus = "correct" | "incorrect" | "neutral";
type TAnswersMap = Record<string, { value?: string; status?: TAnswerStatus }>;

type TPoolItem = { id: string; value: string; used: boolean };

const FillGapsNewExViewImpl: FC<{ data: TFillGapsNewData; isPreview?: boolean }> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isViewMode = !!(rest as any)?.isView;
  const isPresentationMode = !!(rest as any)?.isPresentationMode;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const mode: TFillGapsNewMode = data.mode;
  const gapsById = useMemo(() => {
    const m = new Map<string, TFillGapsNewGap>();
    (data.gaps || []).forEach((g) => m.set(g.id, g));
    return m;
  }, [data.gaps]);

  const canInteract =
    isPreview ||
    !isViewMode ||
    (!!student_id && !isTeacher) ||
    (isTeacher && isPresentationMode);
  const shouldPersistAnswers = !isPreview && isViewMode && !!student_id && !isTeacher;

  const [answersVersion, setAnswersVersion] = useState(0);
  const answersRef = useRef<TAnswersMap>({});
  const [statusByGap, setStatusByGap] = useState<Record<string, TAnswerStatus>>({});
  const saveTimerRef = useRef<number | null>(null);
  const inputCheckTimersRef = useRef<Record<string, number>>({});

  const { writeAnswer, answers, getAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: (rest as any).activeStudentId,
    isTeacher,
    sleepDelay: 1000,
    isPresentationMode,
  });

  // initial load for lesson mode
  useEffect(() => {
    if (isPreview || !student_id) return;
    getAnswers(true).then((a) => {
      try {
        const raw = a?.[data.id]?.answer;
        if (!raw) return;
        const parsedRaw = JSON.parse(raw);
        const parsed: TAnswersMap = {};
        Object.keys(parsedRaw || {}).forEach((k) => {
          const v = parsedRaw[k];
          if (v && typeof v === "object") parsed[k] = { value: v.value, status: v.status };
          else parsed[k] = { value: String(v || ""), status: "neutral" };
        });
        answersRef.current = parsed;
        const m: Record<string, TAnswerStatus> = {};
        Object.keys(parsed).forEach((k) => {
          const s = parsed[k]?.status;
          if (s) m[k] = s;
        });
        setStatusByGap(m);
        setAnswersVersion((v) => v + 1);
      } catch {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id, isPreview]);

  // teacher live updates
  useEffect(() => {
    if (isPreview || !answers) return;
    try {
      const raw = (answers as any)?.[data.id]?.answer;
      if (!raw) return;
      const parsedRaw = JSON.parse(raw);
      const parsed: TAnswersMap = {};
      Object.keys(parsedRaw || {}).forEach((k) => {
        const v = parsedRaw[k];
        if (v && typeof v === "object") parsed[k] = { value: v.value, status: v.status };
        else parsed[k] = { value: String(v || ""), status: "neutral" };
      });
      answersRef.current = parsed;
      const m: Record<string, TAnswerStatus> = {};
      Object.keys(parsed).forEach((k) => {
        const s = parsed[k]?.status;
        if (s) m[k] = s;
      });
      setStatusByGap(m);
      setAnswersVersion((v) => v + 1);
    } catch {}
  }, [answers, data.id, isPreview]);

  const schedulePersist = useCallback(() => {
    if (!shouldPersistAnswers) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        writeAnswer(data.id as any, JSON.stringify(answersRef.current));
      } catch {}
    }, 400);
  }, [data.id, shouldPersistAnswers, writeAnswer]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      Object.values(inputCheckTimersRef.current || {}).forEach((t) => window.clearTimeout(t));
      inputCheckTimersRef.current = {};
    };
  }, []);

  const isCorrectForGap = useCallback((gap: TFillGapsNewGap | undefined, v: string) => {
    const val = (v || "").trim();
    if (!gap || !val) return false;
    return !!gap.options?.some((o) => o.isCorrect && (o.value || "").trim() === val);
  }, []);

  const setAnswer = useCallback(
    (gapId: string, value: string, status: TAnswerStatus) => {
      answersRef.current = {
        ...answersRef.current,
        [gapId]: { value, status },
      };
      setStatusByGap((m) => ({ ...m, [gapId]: status }));
      schedulePersist();
      setAnswersVersion((v) => v + 1);
    },
    [schedulePersist],
  );

  const renderText = useCallback((t: TSlateText, idx: number) => {
    const style: any = {};
    if (t.bold) style.fontWeight = 700;
    if (t.italic) style.fontStyle = "italic";
    if (t.underline) style.textDecoration = "underline";
    if (t.color) style.color = t.color;
    return (
      <span key={idx} style={style}>
        {t.text}
      </span>
    );
  }, []);

  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const dragValueRef = useRef("");
  const [dragXY, setDragXY] = useState({ x: 0, y: 0 });
  const grabOffsetRef = useRef({ dx: 40, dy: 18 });
  const portalRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    portalRef.current = document.body;
  }, []);

  const poolItems = useMemo<TPoolItem[]>(() => {
    const items: TPoolItem[] = [];
    (data.gaps || []).forEach((g) => {
      (g.options || []).forEach((o) => {
        const v = (o.value || "").trim();
        if (!v) return;
        items.push({ id: `${g.id}:${o.id}`, value: v, used: false });
      });
    });
    return items;
  }, [data.gaps]);
  const [pool, setPool] = useState(poolItems);
  useEffect(() => setPool(poolItems), [poolItems, data.id]);

  const onPointerDownChip = useCallback(
    (e: any, item: TPoolItem) => {
      if (!canInteract || mode !== "drag") return;
      try {
        if (e?.cancelable) e.preventDefault();
      } catch {}
      setDragItemId(item.id);
      dragValueRef.current = item.value;
      setDragXY({ x: e.clientX, y: e.clientY });
      try {
        const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
        if (rect) grabOffsetRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      } catch {}
    },
    [canInteract, mode],
  );

  useEffect(() => {
    if (!dragItemId) return;
    const move = (e: any) => {
      try {
        if (e?.cancelable) e.preventDefault();
      } catch {}
      setDragXY({ x: e.clientX, y: e.clientY });
    };
    const up = (e: any) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const drop = el?.closest?.("[data-gap-drop='1']") as HTMLElement | null;
      const gapId = drop?.dataset?.gapId;
      if (gapId) {
        const gap = gapsById.get(gapId);
        const word = dragValueRef.current;
        const ok = !!gap?.options?.some((o) => o.isCorrect && (o.value || "").trim() === word);
        setAnswer(gapId, word, ok ? "correct" : "incorrect");
        if (ok) {
          setPool((prev) => prev.map((p) => (p.id === dragItemId ? { ...p, used: true } : p)));
        }
      }
      setDragItemId(null);
    };
    window.addEventListener("pointermove", move, { passive: false } as any);
    window.addEventListener("pointerup", up, { passive: true } as any);
    window.addEventListener("pointercancel", up, { passive: true } as any);
    window.addEventListener("touchmove", move as any, { passive: false } as any);
    return () => {
      window.removeEventListener("pointermove", move as any);
      window.removeEventListener("pointerup", up as any);
      window.removeEventListener("pointercancel", up as any);
      window.removeEventListener("touchmove", move as any);
    };
  }, [dragItemId, gapsById, setAnswer]);

  const renderGap = useCallback(
    (gapId: string) => {
      const gap = gapsById.get(gapId);
      const current = (answersRef.current?.[gapId]?.value || "").trim();
      const status = statusByGap?.[gapId] || "neutral";
      const correctValues = (gap?.options || []).filter((o) => o.isCorrect).map((o) => o.value).filter(Boolean);
      const tooltipContent = correctValues.join(", ");

      if (!gap) return <span style={{ padding: "0 6px" }} />;

      if (mode === "input") {
        const wrapperClass =
          status === "correct"
            ? "bg-[#A7F3D0] border border-[rgba(22,163,74,0.95)]"
            : status === "incorrect"
              ? "bg-[#FEE2E2] border border-[rgba(220,38,38,0.75)]"
              : "bg-white border border-[rgba(63,40,198,0.25)]";
        return (
          <Tooltip isDisabled={!isTeacher || isPresentationMode || !tooltipContent} content={<div>{tooltipContent}</div>}>
            <span className="inline-flex">
              <Input
                size="sm"
                className={styles.gapInput}
                key={gapId}
                defaultValue={current}
                isDisabled={!canInteract}
                onValueChange={(val) => {
                  if (!canInteract) return;
                  const raw = val || "";
                  const v = raw.trim();
                  if (!v) {
                    if (inputCheckTimersRef.current[gapId]) {
                      window.clearTimeout(inputCheckTimersRef.current[gapId]);
                      delete inputCheckTimersRef.current[gapId];
                    }
                    return setAnswer(gapId, "", "neutral");
                  }

                  // optimistic save value, keep current status until debounce fires
                  answersRef.current[gapId] = {
                    value: raw,
                    status: answersRef.current?.[gapId]?.status || "neutral",
                  };
                  schedulePersist();

                  // If user finished with space, validate immediately
                  if (raw.endsWith(" ")) {
                    if (inputCheckTimersRef.current[gapId]) {
                      window.clearTimeout(inputCheckTimersRef.current[gapId]);
                      delete inputCheckTimersRef.current[gapId];
                    }
                    const latest = raw.trim();
                    const ok = isCorrectForGap(gap, latest);
                    setAnswer(gapId, latest, ok ? "correct" : "incorrect");
                    return;
                  }

                  if (inputCheckTimersRef.current[gapId]) {
                    window.clearTimeout(inputCheckTimersRef.current[gapId]);
                  }
                  inputCheckTimersRef.current[gapId] = window.setTimeout(() => {
                    const latest = (answersRef.current?.[gapId]?.value || "").trim();
                    if (!latest) return setAnswer(gapId, "", "neutral");
                    const ok = isCorrectForGap(gap, latest);
                    setAnswer(gapId, latest, ok ? "correct" : "incorrect");
                  }, 500);
                }}
                onKeyDown={(e) => {
                  if (!canInteract) return;
                  if ((e as any)?.key !== "Enter") return;
                  try {
                    e.preventDefault();
                  } catch {}
                  if (inputCheckTimersRef.current[gapId]) {
                    window.clearTimeout(inputCheckTimersRef.current[gapId]);
                    delete inputCheckTimersRef.current[gapId];
                  }
                  const latest = ((e.target as any)?.value || "").trim();
                  if (!latest) return setAnswer(gapId, "", "neutral");
                  const ok = isCorrectForGap(gap, latest);
                  setAnswer(gapId, latest, ok ? "correct" : "incorrect");
                }}
                onBlur={(e) => {
                  if (!canInteract) return;
                  const v = ((e.target as any).value || "").trim();
                  if (!v) return setAnswer(gapId, "", "neutral");
                  const ok = isCorrectForGap(gap, v);
                  setAnswer(gapId, v, ok ? "correct" : "incorrect");
                }}
                classNames={{
                  inputWrapper: wrapperClass,
                  input:
                    "text-[16px] leading-5 " +
                    (status === "correct"
                      ? "!text-[#3F2A1D] font-bold"
                      : status === "incorrect"
                        ? "text-[#991B1B] font-semibold"
                        : "text-[#111827]"),
                }}
              />
            </span>
          </Tooltip>
        );
      }

      if (mode === "select") {
        const triggerClass =
          status === "correct"
            ? "bg-[#A7F3D0] border border-[rgba(22,163,74,0.95)]"
            : status === "incorrect"
              ? "bg-[#FEE2E2] border border-[rgba(220,38,38,0.75)]"
              : "bg-[#F7F7FF] border border-[rgba(63,40,198,0.25)]";
        const highlightCorrectInDropdown = isPreview || (isTeacher && !isPresentationMode);
        return (
          <Tooltip isDisabled={!isTeacher || isPresentationMode || !tooltipContent} content={<div>{tooltipContent}</div>}>
            <span className="inline-flex">
              <Select
                size="sm"
                className={styles.gapSelect}
                key={gapId + ":" + answersVersion}
                defaultSelectedKeys={current ? [current] : []}
                isDisabled={!canInteract}
                onChange={(e) => {
                  if (!canInteract) return;
                  const v = e.target.value;
                  const ok = isCorrectForGap(gap, v);
                  setAnswer(gapId, v, ok ? "correct" : "incorrect");
                }}
                classNames={{
                  trigger: triggerClass,
                  value:
                    "text-[16px] " +
                    (status === "correct"
                      ? "!text-[#3F2A1D] font-bold"
                      : status === "incorrect"
                        ? "text-[#991B1B] font-semibold"
                        : "text-[#111827]"),
                }}
              >
                {(gap.options || []).map((o) => (
                  <SelectItem
                    key={o.value}
                    value={o.value}
                    textValue={o.value}
                  >
                    <span
                      style={
                        highlightCorrectInDropdown && o.isCorrect
                          ? { color: "#166534", fontWeight: 700 }
                          : undefined
                      }
                    >
                      {o.value}
                    </span>
                  </SelectItem>
                ))}
              </Select>
            </span>
          </Tooltip>
        );
      }

      return (
        <Tooltip isDisabled={!isTeacher || isPresentationMode || !tooltipContent} content={<div>{tooltipContent}</div>}>
          <span
            data-gap-drop="1"
            data-gap-id={gapId}
            className={`${styles.gapDrop} ${
              status === "incorrect" ? styles.gapDropIncorrect : current ? styles.gapDropFilled : ""
            }`}
          >
            <span>{current || "\u00A0"}</span>
          </span>
        </Tooltip>
      );
    },
    [answersVersion, canInteract, gapsById, isCorrectForGap, isPresentationMode, isTeacher, mode, setAnswer, statusByGap],
  );

  const contentToRender = useMemo<TSlateParagraphElement[]>(() => {
    const v = Array.isArray(data.content) ? (data.content as any) : [];
    return v.length ? v : [{ type: "paragraph", children: [{ text: "" }] }] as any;
  }, [data.content]);

  const image = (data as any)?.images?.[0];

  return (
    <div className={styles.root}>
      <div className={`py-6 w-[100%] max-w-[900px] m-auto`}>
        {!!data?.title && (
          <p
            style={{
              color: (data as any)?.titleColor || "#3F28C6",
              fontSize: 34,
              textAlign: "center",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {data.title}
          </p>
        )}
        {!!data?.subtitle && (
          <p style={{ fontSize: 22, textAlign: "center", fontWeight: 700, textTransform: "uppercase" }}>
            {data.subtitle}
          </p>
        )}
        {!!data?.description && (
          <p style={{ fontSize: 18, textAlign: "center", whiteSpace: "pre-line" }}>
            {data.description}
          </p>
        )}
      </div>

      {!!image?.dataURL && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}

      <Card className={styles.card}>
        {mode === "drag" && !!pool.filter((i) => !i.used).length && (
          <div className={styles.pool}>
            {pool
              .filter((i) => !i.used)
              .map((i) => (
                <Chip
                  key={i.id}
                  color="primary"
                  className={`cursor-pointer select-none ${styles.draggableChip}`}
                  onPointerDown={(e) => onPointerDownChip(e, i)}
                >
                  {i.value}
                </Chip>
              ))}
            {!!dragItemId &&
              !!portalRef.current &&
              createPortal(
                <div
                  className={styles.dragGhost}
                  style={{
                    transform: `translate3d(${dragXY.x - grabOffsetRef.current.dx}px, ${dragXY.y - grabOffsetRef.current.dy}px, 0)`,
                  }}
                >
                  <Chip color="primary">{dragValueRef.current}</Chip>
                </div>,
                portalRef.current,
              )}
          </div>
        )}

        <div style={{ fontSize: 18, lineHeight: 1.5 }}>
          {contentToRender.map((p, pIdx) => {
            const children = (p.children || []) as Array<TSlateText | TSlateGapElement>;
            return (
              <p key={pIdx} style={{ marginBottom: 10 }}>
                {children.map((ch: any, idx) => {
                  if (ch?.type === "gap") {
                    return (
                      <span key={idx} style={{ display: "inline-block", margin: "0 6px" }}>
                        {renderGap(ch.gapId)}
                      </span>
                    );
                  }
                  return renderText(ch as TSlateText, idx);
                })}
              </p>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export const FillGapsNewExView = memo(FillGapsNewExViewImpl);

