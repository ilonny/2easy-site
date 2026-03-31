"use client";

import { FC, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Card, Chip, Input, Select, SelectItem, Tooltip } from "@nextui-org/react";
import { createPortal } from "react-dom";
import { AuthContext } from "@/auth";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
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
type TAnswersMap = Record<
  string,
  {
    value?: string;
    status?: TAnswerStatus;
  }
>;

type TPoolItem = {
  id: string;
  value: string;
  used: boolean;
};

/** While drag blocks native touch-scroll, scroll programmatically near viewport edges (mobile + modals). */
const DRAG_EDGE_PX = 72;
const DRAG_MAX_STEP = 18;

function autoScrollForDrag(clientX: number, clientY: number) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const vh = window.innerHeight;
  if (vh <= 0) return;

  let dy = 0;
  if (clientY < DRAG_EDGE_PX) {
    dy = -DRAG_MAX_STEP * ((DRAG_EDGE_PX - clientY) / DRAG_EDGE_PX);
  } else if (clientY > vh - DRAG_EDGE_PX) {
    dy = DRAG_MAX_STEP * ((clientY - (vh - DRAG_EDGE_PX)) / DRAG_EDGE_PX);
  } else {
    return;
  }

  const els = document.elementsFromPoint(clientX, clientY);
  for (const el of els) {
    if (!(el instanceof HTMLElement)) continue;
    let node: HTMLElement | null = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      const oy = cs.overflowY;
      const scrollable =
        (oy === "auto" || oy === "scroll" || oy === "overlay") &&
        node.scrollHeight > node.clientHeight + 2;
      if (scrollable) {
        const maxScroll = node.scrollHeight - node.clientHeight;
        if (dy > 0 && node.scrollTop < maxScroll - 0.5) {
          node.scrollTop = Math.min(node.scrollTop + dy, maxScroll);
          return;
        }
        if (dy < 0 && node.scrollTop > 0.5) {
          node.scrollTop = Math.max(0, node.scrollTop + dy);
          return;
        }
      }
      node = node.parentElement;
    }
  }

  window.scrollBy({ top: dy, left: 0, behavior: "auto" });
}

const FillGapsNewExViewImpl: FC<{ data: TFillGapsNewData; isPreview?: boolean }> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const isViewMode = !!(rest as any)?.isView;
  // In editor list (isView=false and not preview), render a static version:
  // no answer polling/writes, no drag handlers, no internal state -> prevents list rerender storms.
  if (!isViewMode && !isPreview) {
    return <FillGapsNewExViewStatic data={data} />;
  }
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const mode: TFillGapsNewMode = data.mode;
  const gapsById = useMemo(() => {
    const m = new Map<string, TFillGapsNewGap>();
    (data.gaps || []).forEach((g) => m.set(g.id, g));
    return m;
  }, [data.gaps]);

  const [answersMap, setAnswersMap] = useState<TAnswersMap>({});
  // Allow interacting in editor (isView=false) for quick testing,
  // but persist answers only in lesson/student view.
  const isPresentationMode = !!(rest as any)?.isPresentationMode;
  // In presentation mode teacher should be able to interact like a student.
  const canInteract =
    isPreview ||
    !isViewMode ||
    (!!student_id && !isTeacher) ||
    (isTeacher && isPresentationMode);
  const shouldPersistAnswers = !isPreview && isViewMode && !!student_id && !isTeacher;
  const [answersVersion, setAnswersVersion] = useState(0);
  const [statusByGap, setStatusByGap] = useState<Record<string, TAnswerStatus>>(
    {},
  );
  const saveTimerRef = useRef<number | null>(null);

  // Important: these refs must be initialized with correct values on first render.
  // The Draft.js decorator is stable and its inner components won't be recreated often.
  const answersRef = useRef<TAnswersMap>(answersMap);
  const modeRef = useRef<TFillGapsNewMode>(mode);
  const canInteractRef = useRef<boolean>(canInteract);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const { writeAnswer, answers, getAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: (rest as any).activeStudentId,
    isTeacher,
    sleepDelay: 1000,
    isPresentationMode: (rest as any)?.isPresentationMode,
  });

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
          if (v && typeof v === "object") {
            parsed[k] = { value: v.value, status: v.status };
          } else {
            parsed[k] = { value: String(v || ""), status: "neutral" };
          }
        });
        answersRef.current = parsed;
        setAnswersMap(parsed);
        setAnswersVersion((v) => v + 1);
      } catch (e) {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id, isPreview]);

  useEffect(() => {
    if (isPreview || !answers) return;
    try {
      const raw = (answers as any)?.[data.id]?.answer;
      if (!raw) return;
      const parsedRaw = JSON.parse(raw);
      const parsed: TAnswersMap = {};
      Object.keys(parsedRaw || {}).forEach((k) => {
        const v = parsedRaw[k];
        if (v && typeof v === "object") {
          parsed[k] = { value: v.value, status: v.status };
        } else {
          parsed[k] = { value: String(v || ""), status: "neutral" };
        }
      });
      answersRef.current = parsed;
      setAnswersMap(parsed);
      setStatusByGap(() => {
        const m: Record<string, TAnswerStatus> = {};
        Object.keys(parsed || {}).forEach((k) => {
          const s = parsed[k]?.status;
          if (s) m[k] = s;
        });
        return m;
      });
      setAnswersVersion((v) => v + 1);
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isPreview, isTeacher]);

  const schedulePersist = useCallback(() => {
    if (!shouldPersistAnswers) return;
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      try {
        writeAnswer(data.id, JSON.stringify(answersRef.current));
      } catch (e) {}
    }, 400);
  }, [data.id, shouldPersistAnswers, writeAnswer]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    canInteractRef.current = canInteract;
  }, [canInteract]);

  const setAnswer = useCallback(
    (gapId: string, value: string, status: TAnswerStatus = "neutral") => {
      answersRef.current = {
        ...answersRef.current,
        [gapId]: { ...(answersRef.current[gapId] || {}), value, status },
      };
      setStatusByGap((m) => ({ ...m, [gapId]: status }));
      schedulePersist();
    },
    [schedulePersist],
  );

  const isCorrectForGap = useCallback((gap: TFillGapsNewGap | undefined, v: string) => {
    const val = (v || "").trim();
    if (!gap || !val) return false;
    return !!gap.options?.some((o) => o.isCorrect && (o.value || "").trim() === val);
  }, []);

  const usedPoolItemByGapRef = useRef<Record<string, string | undefined>>({});
  const [incorrectGapIds, setIncorrectGapIds] = useState<Record<string, true>>(
    {},
  );

  // Pointer-based drag for iOS Safari (no HTML5 DnD)
  const initialPoolItems = useMemo<TPoolItem[]>(() => {
    const items: TPoolItem[] = [];
    (data.gaps || []).forEach((g) => {
      (g.options || []).forEach((o) => {
        const v = (o.value || "").trim();
        if (!v) return;
        items.push({
          id: `${g.id}:${o.id}`,
          value: v,
          used: false,
        });
      });
    });
    return items;
  }, [data.gaps]);

  const [poolItems, setPoolItems] = useState<TPoolItem[]>(initialPoolItems);

  useEffect(() => {
    // When task changes, reset pool
    setPoolItems(initialPoolItems);
    usedPoolItemByGapRef.current = {};
    setIncorrectGapIds({});
  }, [initialPoolItems, data?.id]);

  // When answers are loaded externally, mark some items as used (by value counts)
  useEffect(() => {
    if (mode !== "drag") return;
    const values = Object.values(answersRef.current || {})
      .map((a) => (a?.value || "").trim())
      .filter(Boolean);
    const counts: Record<string, number> = {};
    values.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });
    setPoolItems((prev) => {
      const next = prev.map((p) => ({ ...p, used: false }));
      const remaining = { ...counts };
      for (let i = 0; i < next.length; i++) {
        const v = next[i].value;
        if (remaining[v] > 0) {
          next[i].used = true;
          remaining[v] -= 1;
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answersVersion, mode]);

  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const dragValueRef = useRef<string>("");
  const [dragXY, setDragXY] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragPointerClientRef = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const grabOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 40, dy: 18 });
  const dragPortalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!dragPortalRef.current) {
      dragPortalRef.current = document.body;
    }
  }, []);

  const onPointerDownWord = useCallback(
    (e: any, item: TPoolItem) => {
      if (!canInteract || mode !== "drag") return;
      // Prevent page scroll on mobile while dragging
      try {
        if (e?.cancelable) e.preventDefault();
      } catch (err) {}
      pointerIdRef.current = e.pointerId;
      setDragItemId(item.id);
      dragValueRef.current = item.value;
      dragPointerClientRef.current = { x: e.clientX, y: e.clientY };
      setDragXY({ x: e.clientX, y: e.clientY });
      try {
        const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
        if (rect) {
          grabOffsetRef.current = {
            dx: e.clientX - rect.left,
            dy: e.clientY - rect.top,
          };
        }
      } catch (err) {}
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    },
    [canInteract, mode],
  );

  const onPointerMove = useCallback(
    (e: any) => {
      if (!dragItemId) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      dragPointerClientRef.current = { x: e.clientX, y: e.clientY };
      setDragXY({ x: e.clientX, y: e.clientY });
    },
    [dragItemId],
  );

  const onPointerUp = useCallback(
    (e: any) => {
      if (!dragItemId) return;
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const drop = el?.closest?.("[data-gap-drop='1']") as HTMLElement | null;
      const gapId = drop?.dataset?.gapId;
      const word = dragValueRef.current;
      if (gapId) {
        const gap = gapsById.get(gapId);
        const isCorrect = !!gap?.options?.some(
          (o) => o.isCorrect && (o.value || "").trim() === word,
        );
        if (isCorrect) {
          // free previous used item for this gap
          const prevUsedItemId = usedPoolItemByGapRef.current?.[gapId];
          if (prevUsedItemId) {
            setPoolItems((prev) =>
              prev.map((p) => (p.id === prevUsedItemId ? { ...p, used: false } : p)),
            );
          }
          usedPoolItemByGapRef.current[gapId] = dragItemId;
          setPoolItems((prev) =>
            prev.map((p) => (p.id === dragItemId ? { ...p, used: true } : p)),
          );
          setAnswer(gapId, word, "correct");
          setIncorrectGapIds((m) => {
            if (!m[gapId]) return m;
            const copy = { ...m };
            delete copy[gapId];
            return copy;
          });
        } else {
          // keep the word in the pool, but show it in the gap and mark red
          setAnswer(gapId, word, "incorrect");
          setIncorrectGapIds((m) => ({ ...m, [gapId]: true }));
          window.setTimeout(() => {
            setIncorrectGapIds((m) => {
              if (!m[gapId]) return m;
              const copy = { ...m };
              delete copy[gapId];
              return copy;
            });
          }, 1500);
          // do not set answer and do not consume the word
        }
      }
      setDragItemId(null);
      pointerIdRef.current = null;
    },
    [dragItemId, gapsById, setAnswer],
  );

  // Edge auto-scroll while dragging (native scroll is suppressed on touch)
  useEffect(() => {
    if (!dragItemId) return;
    let cancelled = false;
    let rafId = 0;
    const loop = () => {
      if (cancelled) return;
      const { x, y } = dragPointerClientRef.current;
      autoScrollForDrag(x, y);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [dragItemId]);

  // Keep drag smooth across scroll/overflow containers (iOS + modals)
  useEffect(() => {
    if (!dragItemId) return;
    const move = (e: any) => {
      try {
        if (e?.cancelable) e.preventDefault();
      } catch (err) {}
      onPointerMove(e);
    };
    const up = (e: any) => onPointerUp(e);
    const touchMove = (e: TouchEvent) => {
      try {
        if (e.cancelable) e.preventDefault();
      } catch (err) {}
    };
    window.addEventListener("pointermove", move, { passive: false } as any);
    window.addEventListener("pointerup", up, { passive: true } as any);
    window.addEventListener("pointercancel", up, { passive: true } as any);
    window.addEventListener("touchmove", touchMove, { passive: false } as any);
    return () => {
      window.removeEventListener("pointermove", move as any);
      window.removeEventListener("pointerup", up as any);
      window.removeEventListener("pointercancel", up as any);
      window.removeEventListener("touchmove", touchMove as any);
    };
  }, [dragItemId, onPointerMove, onPointerUp]);

  const renderGap = useCallback(
    (gapId: string) => {
      const gap = gapsById.get(gapId);
      const current = answersRef.current?.[gapId]?.value || "";
      const correctValues = (gap?.options || [])
        .filter((o) => o.isCorrect)
        .map((o) => o.value);
      const modeCurrent = modeRef.current;
      const canInteractCurrent = canInteractRef.current;
      const status = answersRef.current?.[gapId]?.status;

      if (!gap) {
        return <span style={{ padding: "0 8px" }} />;
      }

      if (modeCurrent === "input") {
        const statusEffective = statusByGap?.[gapId] || status || "neutral";
        const wrapperClass =
          statusEffective === "correct"
            ? "bg-[#A7F3D0] border border-[rgba(22,163,74,0.95)]"
            : statusEffective === "incorrect"
              ? "bg-[#FEE2E2] border border-[rgba(220,38,38,0.75)]"
              : "bg-white border border-[rgba(63,40,198,0.25)]";
        const tooltipContent = (correctValues || []).filter(Boolean).join(", ");
        return (
          <Tooltip
            isDisabled={
              !isTeacher || (rest as any)?.isPresentationMode || !tooltipContent
            }
            content={isTeacher ? <div>{tooltipContent}</div> : <></>}
          >
            <span className="inline-flex">
              <Input
                size="sm"
                className={styles.gapInput}
                key={gapId + ":" + answersVersion}
                defaultValue={current}
                placeholder={canInteractCurrent ? "Введите ответ" : ""}
                onValueChange={(val) => {
                  if (!canInteractCurrent) return;
                  // While typing: only mark success immediately; don't mark incorrect until blur.
                  const v = (val || "").trim();
                  if (!v) {
                    setAnswer(gapId, "", "neutral");
                    setStatusByGap((m) => ({ ...m, [gapId]: "neutral" }));
                    return;
                  }
                  const ok = isCorrectForGap(gap, v);
                  if (ok) {
                    setAnswer(gapId, val, "correct");
                    setStatusByGap((m) => ({ ...m, [gapId]: "correct" }));
                  } else {
                    setAnswer(gapId, val, "neutral");
                    setStatusByGap((m) => ({ ...m, [gapId]: "neutral" }));
                  }
                }}
                onBlur={(e) => {
                  if (!canInteractRef.current) return;
                  const v = ((e?.target as any)?.value || "").trim();
                  if (!v) {
                    setAnswer(gapId, "", "neutral");
                    setStatusByGap((m) => ({ ...m, [gapId]: "neutral" }));
                    return;
                  }
                  const ok = isCorrectForGap(gap, v);
                  setAnswer(gapId, v, ok ? "correct" : "incorrect");
                  setStatusByGap((m) => ({
                    ...m,
                    [gapId]: ok ? "correct" : "incorrect",
                  }));
                }}
                isDisabled={!canInteractCurrent}
                color={
                  statusEffective === "correct"
                    ? "success"
                    : statusEffective === "incorrect"
                      ? "danger"
                      : "primary"
                }
                classNames={{
                  inputWrapper: wrapperClass,
                  input:
                    "text-[16px] leading-5 " +
                    (statusEffective === "correct"
                      ? "!text-[#3F2A1D] font-bold"
                      : statusEffective === "incorrect"
                        ? "text-[#991B1B] font-semibold"
                        : "text-[#111827]"),
                }}
              />
            </span>
          </Tooltip>
        );
      }

      if (modeCurrent === "select") {
        const statusEffective = statusByGap?.[gapId] || status || "neutral";
        const triggerClass =
          statusEffective === "correct"
            ? "bg-[#A7F3D0] border border-[rgba(22,163,74,0.95)]"
            : statusEffective === "incorrect"
              ? "bg-[#FEE2E2] border border-[rgba(220,38,38,0.75)]"
              : "bg-[#F7F7FF] border border-[rgba(63,40,198,0.25)]";
        const tooltipContent = (correctValues || []).filter(Boolean).join(", ");
        return (
          <Tooltip
            isDisabled={
              !isTeacher || (rest as any)?.isPresentationMode || !tooltipContent
            }
            content={isTeacher ? <div>{tooltipContent}</div> : <></>}
          >
            <span className="inline-flex">
              <Select
                size="sm"
                className={styles.gapSelect}
                key={gapId + ":" + answersVersion}
                defaultSelectedKeys={current ? [current] : []}
                onChange={(e) => {
                  if (!canInteractCurrent) return;
                  const v = e.target.value;
                  const isCorrect = !!gap.options?.some(
                    (o) => o.isCorrect && (o.value || "").trim() === (v || "").trim(),
                  );
                  setAnswer(gapId, v, isCorrect ? "correct" : "incorrect");
                }}
                isDisabled={!canInteractCurrent}
                color={
                  statusEffective === "correct"
                    ? "success"
                    : statusEffective === "incorrect"
                      ? "danger"
                      : "primary"
                }
                classNames={{
                  trigger: triggerClass,
                  value:
                    "text-[16px] " +
                    (statusEffective === "correct"
                      ? "!text-[#3F2A1D] font-bold"
                      : statusEffective === "incorrect"
                        ? "text-[#991B1B] font-semibold"
                        : "text-[#111827]"),
                }}
              >
                {(gap.options || []).map((o) => (
                  <SelectItem key={o.value} value={o.value} textValue={o.value}>
                    <div
                      className={`flex items-center ${
                        isTeacher &&
                        !(rest as any)?.isPresentationMode &&
                        o.isCorrect
                          ? "text-success"
                          : ""
                      }`}
                    >
                      {o.value}
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </span>
          </Tooltip>
        );
      }

      return (
        <span
          data-gap-drop="1"
          data-gap-id={gapId}
          className={`${styles.gapDrop} ${
            (statusByGap?.[gapId] || answersRef.current?.[gapId]?.status) === "incorrect" ||
            incorrectGapIds?.[gapId]
              ? styles.gapDropIncorrect
              : current
              ? styles.gapDropFilled
              : ""
          }`}
          style={{ display: "inline-flex", verticalAlign: "middle" }}
        >
          <Tooltip
            isDisabled={!isTeacher || (rest as any)?.isPresentationMode}
            content={isTeacher ? <div>{correctValues?.[0] || ""}</div> : <></>}
          >
            <span>{current || "Перетащите сюда"}</span>
          </Tooltip>
        </span>
      );
    },
    [answersVersion, gapsById, isTeacher, rest, setAnswer],
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
          <p
            style={{
              fontSize: 22,
              textAlign: "center",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {data.subtitle}
          </p>
        )}
        {!!data?.description && (
          <p
            style={{
              fontSize: 18,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {data.description}
          </p>
        )}
      </div>

      {!!image?.dataURL && (
        <Zoom>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}

      <Card className={styles.card}>
        {mode === "drag" && !!poolItems.filter((i) => !i.used).length && (
          <div className={styles.pool}>
            {poolItems
              .filter((i) => !i.used)
              .map((i) => (
              <Chip
                key={i.id}
                color="primary"
                className={`cursor-pointer select-none ${styles.draggableChip}`}
                onPointerDown={(e) => onPointerDownWord(e, i)}
              >
                {i.value}
              </Chip>
            ))}
            {!!dragItemId && (
              <>
                {!!dragPortalRef.current &&
                  createPortal(
                    <div
                      className={styles.dragGhost}
                      style={{
                        transform: `translate3d(${dragXY.x - grabOffsetRef.current.dx}px, ${
                          dragXY.y - grabOffsetRef.current.dy
                        }px, 0)`,
                      }}
                    >
                      <Chip color="primary">{dragValueRef.current}</Chip>
                    </div>,
                    dragPortalRef.current,
                  )}
              </>
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

const FillGapsNewExViewStatic: FC<{ data: TFillGapsNewData }> = ({ data }) => {
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const mode: TFillGapsNewMode = data.mode;
  const gapsById = useMemo(() => {
    const m = new Map<string, TFillGapsNewGap>();
    (data.gaps || []).forEach((g) => m.set(g.id, g));
    return m;
  }, [data.gaps]);

  // Local-only interaction for editor list (no persistence)
  const initialStaticPoolItems = useMemo<TPoolItem[]>(() => {
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
  const [staticPoolItems, setStaticPoolItems] = useState<TPoolItem[]>(
    initialStaticPoolItems,
  );
  const staticAnswersRef = useRef<TAnswersMap>({});
  const usedItemByGapRef = useRef<Record<string, string | undefined>>({});
  const [staticAnswersVersion, setStaticAnswersVersion] = useState(0);
  const [staticIncorrect, setStaticIncorrect] = useState<Record<string, true>>(
    {},
  );

  useEffect(() => {
    setStaticPoolItems(initialStaticPoolItems);
    staticAnswersRef.current = {};
    usedItemByGapRef.current = {};
    setStaticIncorrect({});
    setStaticAnswersVersion((v) => v + 1);
  }, [initialStaticPoolItems, data?.id]);

  const [sDragItemId, setSDragItemId] = useState<string | null>(null);
  const sDragValueRef = useRef<string>("");
  const [sDragXY, setSDragXY] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const sDragPointerClientRef = useRef({ x: 0, y: 0 });
  const sPointerIdRef = useRef<number | null>(null);
  const sGrabOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 40, dy: 18 });
  const sPortalRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    sPortalRef.current = document.body;
  }, []);

  const sOnPointerDown = useCallback((e: any, item: TPoolItem) => {
    if (mode !== "drag") return;
    try {
      if (e?.cancelable) e.preventDefault();
    } catch (err) {}
    sPointerIdRef.current = e.pointerId;
    setSDragItemId(item.id);
    sDragValueRef.current = item.value;
    sDragPointerClientRef.current = { x: e.clientX, y: e.clientY };
    setSDragXY({ x: e.clientX, y: e.clientY });
    try {
      const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
      if (rect) {
        sGrabOffsetRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      }
    } catch {}
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }, [mode]);

  const sOnPointerMove = useCallback((e: any) => {
    if (!sDragItemId) return;
    if (sPointerIdRef.current !== null && e.pointerId !== sPointerIdRef.current) return;
    sDragPointerClientRef.current = { x: e.clientX, y: e.clientY };
    setSDragXY({ x: e.clientX, y: e.clientY });
  }, [sDragItemId]);

  const sOnPointerUp = useCallback((e: any) => {
    if (!sDragItemId) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const drop = el?.closest?.("[data-gap-drop='1']") as HTMLElement | null;
    const gapId = drop?.dataset?.gapId;
    const word = sDragValueRef.current;
    if (gapId) {
      const gap = gapsById.get(gapId);
      const isCorrect = !!gap?.options?.some(
        (o) => o.isCorrect && (o.value || "").trim() === word,
      );
      if (isCorrect) {
        const prevUsed = usedItemByGapRef.current?.[gapId];
        if (prevUsed) {
          setStaticPoolItems((prev) => prev.map((p) => (p.id === prevUsed ? { ...p, used: false } : p)));
        }
        usedItemByGapRef.current[gapId] = sDragItemId;
        setStaticPoolItems((prev) => prev.map((p) => (p.id === sDragItemId ? { ...p, used: true } : p)));
        staticAnswersRef.current = {
          ...staticAnswersRef.current,
          [gapId]: { value: word, status: "correct" },
        };
        setStaticIncorrect((m) => {
          if (!m[gapId]) return m;
          const copy = { ...m };
          delete copy[gapId];
          return copy;
        });
        setStaticAnswersVersion((v) => v + 1);
      } else {
        staticAnswersRef.current = {
          ...staticAnswersRef.current,
          [gapId]: { value: word, status: "incorrect" },
        };
        setStaticIncorrect((m) => ({ ...m, [gapId]: true }));
        window.setTimeout(() => {
          setStaticIncorrect((m) => {
            if (!m[gapId]) return m;
            const copy = { ...m };
            delete copy[gapId];
            return copy;
          });
        }, 1200);
        setStaticAnswersVersion((v) => v + 1);
      }
    }
    setSDragItemId(null);
    sPointerIdRef.current = null;
  }, [gapsById, sDragItemId]);

  useEffect(() => {
    if (!sDragItemId) return;
    let cancelled = false;
    let rafId = 0;
    const loop = () => {
      if (cancelled) return;
      const { x, y } = sDragPointerClientRef.current;
      autoScrollForDrag(x, y);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [sDragItemId]);

  useEffect(() => {
    if (!sDragItemId) return;
    const mv = (e: any) => {
      try {
        if (e?.cancelable) e.preventDefault();
      } catch (err) {}
      sOnPointerMove(e);
    };
    const up = (e: any) => sOnPointerUp(e);
    const touchMove = (e: TouchEvent) => {
      try {
        if (e.cancelable) e.preventDefault();
      } catch (err) {}
    };
    window.addEventListener("pointermove", mv, { passive: false } as any);
    window.addEventListener("pointerup", up, { passive: true } as any);
    window.addEventListener("pointercancel", up, { passive: true } as any);
    window.addEventListener("touchmove", touchMove, { passive: false } as any);
    return () => {
      window.removeEventListener("pointermove", mv as any);
      window.removeEventListener("pointerup", up as any);
      window.removeEventListener("pointercancel", up as any);
      window.removeEventListener("touchmove", touchMove as any);
    };
  }, [sDragItemId, sOnPointerMove, sOnPointerUp]);
  const contentToRender = useMemo<TSlateParagraphElement[]>(() => {
    const v = Array.isArray(data.content) ? (data.content as any) : [];
    return v.length ? v : [{ type: "paragraph", children: [{ text: "" }] }] as any;
  }, [data.content]);

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

  const renderStaticGap = useCallback((gapId: string) => {
    const gap = gapsById.get(gapId);
    const correctValues = (gap?.options || [])
      .filter((o) => o.isCorrect)
      .map((o) => o.value)
      .filter(Boolean);
    const tooltipContent = correctValues.length ? correctValues.join(", ") : "";
    const local = staticAnswersRef.current?.[gapId];
    const currentVal = (local?.value || "").trim();
    const isIncorrect = local?.status === "incorrect" || staticIncorrect?.[gapId];

    if (mode === "input") {
      const wrapperClass =
        isIncorrect
          ? "bg-[#FEE2E2] border border-[rgba(220,38,38,0.75)]"
          : local?.status === "correct"
            ? "bg-[#D1FAE5] border border-[rgba(22,163,74,0.75)]"
            : "bg-white";
      return (
        <Tooltip
          isDisabled={!isTeacher || !tooltipContent}
          content={<div>{tooltipContent}</div>}
        >
          <span
            className={styles.gapDrop}
            style={{
              display: "inline-flex",
              verticalAlign: "middle",
              opacity: 0.9,
              background: "#fff",
              padding: 0,
              border: "none",
            }}
          >
            <Input
              size="sm"
              className={styles.gapInput}
              placeholder="Ответ"
              classNames={{
                inputWrapper: wrapperClass,
                input:
                  "text-[16px] leading-5 " +
                  (local?.status === "correct"
                    ? "text-[#065F46] font-semibold"
                    : isIncorrect
                      ? "text-[#991B1B] font-semibold"
                      : "text-[#111827]"),
              }}
              color={
                local?.status === "correct"
                  ? "success"
                  : isIncorrect
                    ? "danger"
                    : "primary"
              }
              onValueChange={(val) => {
                const v = (val || "").trim();
                if (!v) {
                  staticAnswersRef.current = {
                    ...staticAnswersRef.current,
                    [gapId]: { value: "", status: "neutral" },
                  };
                  setStaticIncorrect((m) => {
                    if (!m[gapId]) return m;
                    const copy = { ...m };
                    delete copy[gapId];
                    return copy;
                  });
                  setStaticAnswersVersion((v2) => v2 + 1);
                  return;
                }
                // While typing: only mark success immediately; don't mark incorrect until blur.
                const isCorrect = !!gap?.options?.some(
                  (o) => o.isCorrect && (o.value || "").trim() === v,
                );
                staticAnswersRef.current = {
                  ...staticAnswersRef.current,
                  [gapId]: { value: val, status: isCorrect ? "correct" : "neutral" },
                };
                setStaticIncorrect((m) => {
                  if (isCorrect) {
                    if (!m[gapId]) return m;
                    const copy = { ...m };
                    delete copy[gapId];
                    return copy;
                  }
                  if (!m[gapId]) return m;
                  const copy = { ...m };
                  delete copy[gapId];
                  return copy;
                });
                setStaticAnswersVersion((v2) => v2 + 1);
              }}
              onBlur={(e) => {
                const v = ((e?.target as any)?.value || "").trim();
                if (!v) {
                  staticAnswersRef.current = {
                    ...staticAnswersRef.current,
                    [gapId]: { value: "", status: "neutral" },
                  };
                  setStaticIncorrect((m) => {
                    if (!m[gapId]) return m;
                    const copy = { ...m };
                    delete copy[gapId];
                    return copy;
                  });
                  setStaticAnswersVersion((v2) => v2 + 1);
                  return;
                }
                const isCorrect = !!gap?.options?.some(
                  (o) => o.isCorrect && (o.value || "").trim() === v,
                );
                staticAnswersRef.current = {
                  ...staticAnswersRef.current,
                  [gapId]: { value: v, status: isCorrect ? "correct" : "incorrect" },
                };
                setStaticIncorrect((m) => {
                  if (isCorrect) {
                    if (!m[gapId]) return m;
                    const copy = { ...m };
                    delete copy[gapId];
                    return copy;
                  }
                  return { ...m, [gapId]: true };
                });
                if (!isCorrect) {
                  window.setTimeout(() => {
                    setStaticIncorrect((m) => {
                      if (!m[gapId]) return m;
                      const copy = { ...m };
                      delete copy[gapId];
                      return copy;
                    });
                  }, 1200);
                }
                setStaticAnswersVersion((v2) => v2 + 1);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
          </span>
        </Tooltip>
      );
    }
    if (mode === "select") {
      const triggerClass =
        isIncorrect
          ? "bg-[#FEE2E2] border border-[rgba(220,38,38,0.75)]"
          : local?.status === "correct"
            ? "bg-[#A7F3D0] border border-[rgba(22,163,74,0.95)]"
            : "bg-[#F7F7FF]";
      return (
        <Tooltip
          isDisabled={!isTeacher || !tooltipContent}
          content={<div>{tooltipContent}</div>}
        >
          <span
            className={styles.gapDrop}
            style={{
              display: "inline-flex",
              verticalAlign: "middle",
              opacity: 0.9,
              background: "#fff",
              padding: 0,
              border: "none",
            }}
          >
            <Select
              size="sm"
              className={styles.gapSelect}
              placeholder="Выбрать…"
              classNames={{
                trigger: triggerClass,
                value:
                  "text-[16px] " +
                  (local?.status === "correct"
                    ? "!text-[#3F2A1D] font-bold"
                    : isIncorrect
                      ? "text-[#991B1B] font-semibold"
                      : "text-[#111827]"),
              }}
              color={
                local?.status === "correct"
                  ? "success"
                  : isIncorrect
                    ? "danger"
                    : "primary"
              }
              onChange={(e) => {
                const v = e.target.value;
                const isCorrect = !!gap?.options?.some(
                  (o) => o.isCorrect && (o.value || "").trim() === (v || "").trim(),
                );
                staticAnswersRef.current = {
                  ...staticAnswersRef.current,
                  [gapId]: { value: v, status: isCorrect ? "correct" : "incorrect" },
                };
                setStaticIncorrect((m) => {
                  if (isCorrect) {
                    if (!m[gapId]) return m;
                    const copy = { ...m };
                    delete copy[gapId];
                    return copy;
                  }
                  return { ...m, [gapId]: true };
                });
                if (!isCorrect) {
                  window.setTimeout(() => {
                    setStaticIncorrect((m) => {
                      if (!m[gapId]) return m;
                      const copy = { ...m };
                      delete copy[gapId];
                      return copy;
                    });
                  }, 1200);
                }
                setStaticAnswersVersion((v2) => v2 + 1);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {(gap?.options || []).length
                ? (gap?.options || []).map((o) => (
                    <SelectItem key={o.value} value={o.value} textValue={o.value}>
                      {o.value}
                    </SelectItem>
                  ))
                : [
                    <SelectItem key="-" value="-" textValue="-">
                      —
                    </SelectItem>,
                  ]}
            </Select>
          </span>
        </Tooltip>
      );
    }
    return (
      <Tooltip isDisabled={!isTeacher || !tooltipContent} content={<div>{tooltipContent}</div>}>
        <span
          data-gap-drop="1"
          data-gap-id={gapId}
          className={`${styles.gapDrop} ${
            isIncorrect ? styles.gapDropIncorrect : currentVal ? styles.gapDropFilled : ""
          }`}
          style={{ display: "inline-flex", verticalAlign: "middle" }}
        >
          <span>{currentVal || "Перетащите сюда"}</span>
        </span>
      </Tooltip>
    );
  }, [gapsById, isTeacher, mode, staticIncorrect, staticAnswersVersion]);

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
          <p
            style={{
              fontSize: 22,
              textAlign: "center",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {data.subtitle}
          </p>
        )}
        {!!data?.description && (
          <p
            style={{
              fontSize: 18,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {data.description}
          </p>
        )}
      </div>

      {!!(data as any)?.images?.[0]?.dataURL && (
        <Zoom>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(data as any)?.images?.[0]?.dataURL}
            style={{ maxHeight: 400, margin: "auto" }}
          />
        </Zoom>
      )}

      <Card className={styles.card}>
        {mode === "drag" && !!staticPoolItems.filter((i) => !i.used).length && (
          <div className={styles.pool}>
            {staticPoolItems
              .filter((i) => !i.used)
              .map((i) => (
              <Chip
                key={i.id}
                color="primary"
                className={`select-none cursor-pointer ${styles.draggableChip}`}
                onPointerDown={(e) => sOnPointerDown(e, i)}
              >
                {i.value}
              </Chip>
            ))}
            {!!sDragItemId && !!sPortalRef.current &&
              createPortal(
                <div
                  className={styles.dragGhost}
                  style={{
                    transform: `translate3d(${sDragXY.x - sGrabOffsetRef.current.dx}px, ${
                      sDragXY.y - sGrabOffsetRef.current.dy
                    }px, 0)`,
                  }}
                >
                  <Chip color="primary">{sDragValueRef.current}</Chip>
                </div>,
                sPortalRef.current,
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
                        {renderStaticGap(ch.gapId)}
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

