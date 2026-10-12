"use client";

/* eslint-disable @next/next/no-img-element */

import { Card, Chip } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { AuthContext } from "@/auth";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import {
  normalizeUnscrambleToken,
  TUnscrambleSentence,
  TUnscrambleWordsData,
} from "../../editor/UnscrambleWords/types";
import styles from "./styles.module.css";

type TAnswerStatus = "correct" | "incorrect" | "neutral";
type TAnswersMap = Record<
  string,
  { value?: string; status?: TAnswerStatus; tokenId?: string }
>;

type TPoolItem = {
  id: string;
  sentenceId: string;
  value: string;
  used: boolean;
};

function slotAnswerKey(sentenceId: string, slotIndex: number) {
  return `${sentenceId}:${slotIndex}`;
}

function poolChipSizeClass(value: string) {
  const len = (value || "").trim().length;
  if (len > 36) return styles.chipSizeXLong;
  if (len > 20) return styles.chipSizeLong;
  return styles.chipSizeDefault;
}

function shufflePoolItems(items: TPoolItem[]): TPoolItem[] {
  const copy = items.map((x) => ({ ...x }));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i];
    copy[i] = copy[j];
    copy[j] = t;
  }
  return copy;
}

function getClientXY(e: any): { x: number; y: number } {
  if (typeof e?.clientX === "number" && typeof e?.clientY === "number") {
    return { x: e.clientX, y: e.clientY };
  }
  const t = e?.changedTouches?.[0] ?? e?.touches?.[0];
  if (t && typeof t.clientX === "number" && typeof t.clientY === "number") {
    return { x: t.clientX, y: t.clientY };
  }
  return { x: 0, y: 0 };
}

const UnscrambleWordsExViewImpl: FC<{
  data: TUnscrambleWordsData;
  isPreview?: boolean;
}> = ({ data, isPreview = false, ...rest }) => {
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isViewMode = !!(rest as any)?.isView;
  const isPresentationMode = !!(rest as any)?.isPresentationMode;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const sentences = useMemo(
    () =>
      (data.sentences || []).filter(
        (s) => Array.isArray(s.tokens) && s.tokens.length >= 2,
      ),
    [data.sentences],
  );

  const sentencesById = useMemo(() => {
    const m = new Map<string, TUnscrambleSentence>();
    sentences.forEach((s) => m.set(s.id, s));
    return m;
  }, [sentences]);

  const canInteract =
    isPreview ||
    !isViewMode ||
    (!!student_id && !isTeacher) ||
    (isTeacher && isPresentationMode);
  const shouldPersistAnswers =
    !isPreview && isViewMode && !!student_id && !isTeacher;

  const [answersVersion, setAnswersVersion] = useState(0);
  const [serverHydrationVersion, setServerHydrationVersion] = useState(0);
  const answersRef = useRef<TAnswersMap>({});
  const [statusBySlot, setStatusBySlot] = useState<
    Record<string, TAnswerStatus>
  >({});
  const saveTimerRef = useRef<number | null>(null);

  const { writeAnswer, answers, getAnswers, resetSeq } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: (rest as any).activeStudentId,
    isTeacher,
    isPresentationMode,
  });

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    answersRef.current = {};
    setStatusBySlot({});
    setServerHydrationVersion((v) => v + 1);
    setAnswersVersion((v) => v + 1);
  }, [resetSeq]);

  useEffect(() => {
    if (isPreview || !student_id) return;
    getAnswers(true).then((a) => {
      try {
        const raw = a?.[data.id as number]?.answer;
        if (!raw) return;
        const parsedRaw = JSON.parse(raw);
        const parsed: TAnswersMap = {};
        Object.keys(parsedRaw || {}).forEach((k) => {
          const v = parsedRaw[k];
          if (v && typeof v === "object")
            parsed[k] = {
              value: v.value,
              status: v.status,
              tokenId: v.tokenId,
            };
          else parsed[k] = { value: String(v || ""), status: "neutral" };
        });
        answersRef.current = parsed;
        const m: Record<string, TAnswerStatus> = {};
        Object.keys(parsed).forEach((k) => {
          const s = parsed[k]?.status;
          if (s) m[k] = s;
        });
        setStatusBySlot(m);
        setServerHydrationVersion((v) => v + 1);
        setAnswersVersion((v) => v + 1);
      } catch {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id, isPreview]);

  useEffect(() => {
    if (isPreview || !answers || !isTeacher) return;
    if (!(rest as any)?.activeStudentId) return;
    try {
      const raw = (answers as any)?.[data.id as number]?.answer;
      if (!raw) {
        if (Object.keys(answersRef.current || {}).length > 0) {
          answersRef.current = {};
          setStatusBySlot({});
          setServerHydrationVersion((v) => v + 1);
          setAnswersVersion((v) => v + 1);
        }
        return;
      }
      const parsedRaw = JSON.parse(raw);
      const parsed: TAnswersMap = {};
      Object.keys(parsedRaw || {}).forEach((k) => {
        const v = parsedRaw[k];
        if (v && typeof v === "object")
          parsed[k] = {
            value: v.value,
            status: v.status,
            tokenId: v.tokenId,
          };
        else parsed[k] = { value: String(v || ""), status: "neutral" };
      });
      answersRef.current = parsed;
      const m: Record<string, TAnswerStatus> = {};
      Object.keys(parsed).forEach((k) => {
        const s = parsed[k]?.status;
        if (s) m[k] = s;
      });
      setStatusBySlot(m);
      setServerHydrationVersion((v) => v + 1);
      setAnswersVersion((v) => v + 1);
    } catch {}
  }, [answers, data.id, isPreview, isTeacher, (rest as any)?.activeStudentId]);

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
    };
  }, []);

  const setAnswer = useCallback(
    (
      answerKey: string,
      value: string,
      status: TAnswerStatus,
      tokenId?: string,
    ) => {
      answersRef.current = {
        ...answersRef.current,
        [answerKey]: { value, status, tokenId },
      };
      setStatusBySlot((m) => ({ ...m, [answerKey]: status }));
      schedulePersist();
      setAnswersVersion((v) => v + 1);
    },
    [schedulePersist],
  );

  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const dragValueRef = useRef("");
  const dragSentenceIdRef = useRef("");
  const [dragXY, setDragXY] = useState({ x: 0, y: 0 });
  const grabOffsetRef = useRef({ dx: 40, dy: 18 });
  const portalRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    portalRef.current = document.body;
  }, []);

  const poolItemsBySentence = useMemo(() => {
    const map = new Map<string, TPoolItem[]>();
    sentences.forEach((s) => {
      const items = (s.tokens || []).map((t) => ({
        id: t.id,
        sentenceId: s.id,
        value: t.value,
        used: false,
      }));
      map.set(s.id, items);
    });
    return map;
  }, [sentences]);

  const dragPoolKey = useMemo(() => {
    const ex = data.id ?? "new";
    const part = sentences
      .map(
        (s) =>
          `${s.id}:${(s.tokens || []).map((t) => `${t.id}:${t.value}`).join("|")}`,
      )
      .join(";");
    return `${ex}|${part}`;
  }, [data.id, sentences]);

  const poolsStableRef = useRef<{
    key: string;
    pools: Map<string, TPoolItem[]>;
  } | null>(null);
  const [pools, setPools] = useState<Map<string, TPoolItem[]>>(new Map());

  const applyUsedFlags = useCallback(
    (items: TPoolItem[], parsed: TAnswersMap, sentenceId: string) => {
      const usedTokenIds = new Set<string>();
      Object.entries(parsed).forEach(([key, a]) => {
        if (!key.startsWith(`${sentenceId}:`)) return;
        if (a?.status === "correct" && a.tokenId) usedTokenIds.add(a.tokenId);
      });
      if (usedTokenIds.size) {
        return items.map((p) =>
          usedTokenIds.has(p.id) ? { ...p, used: true } : p,
        );
      }
      const usedValues = new Set(
        Object.entries(parsed)
          .filter(
            ([key, a]) =>
              key.startsWith(`${sentenceId}:`) &&
              a?.status === "correct" &&
              normalizeUnscrambleToken(a.value || ""),
          )
          .map(([, a]) => normalizeUnscrambleToken(a.value || "")),
      );
      if (!usedValues.size) return items;
      const claimed = new Set<string>();
      return items.map((p) => {
        const key = normalizeUnscrambleToken(p.value);
        if (!usedValues.has(key) || claimed.has(p.id) || p.used) return p;
        claimed.add(p.id);
        usedValues.delete(key);
        return { ...p, used: true };
      });
    },
    [],
  );

  useEffect(() => {
    const prev = poolsStableRef.current;
    if (prev?.key === dragPoolKey) return;
    const next = new Map<string, TPoolItem[]>();
    poolItemsBySentence.forEach((items, sentenceId) => {
      next.set(
        sentenceId,
        applyUsedFlags(
          shufflePoolItems(items),
          answersRef.current,
          sentenceId,
        ),
      );
    });
    poolsStableRef.current = { key: dragPoolKey, pools: next };
    setPools(next);
  }, [dragPoolKey, poolItemsBySentence, applyUsedFlags]);

  useEffect(() => {
    if (!serverHydrationVersion) return;
    setPools((prev) => {
      if (!prev.size) return prev;
      const next = new Map<string, TPoolItem[]>();
      prev.forEach((items, sentenceId) => {
        const cleared = items.map((p) => ({ ...p, used: false }));
        next.set(
          sentenceId,
          applyUsedFlags(cleared, answersRef.current, sentenceId),
        );
      });
      poolsStableRef.current = { key: dragPoolKey, pools: next };
      return next;
    });
  }, [serverHydrationVersion, applyUsedFlags, dragPoolKey]);

  const onPointerDownChip = useCallback(
    (e: any, item: TPoolItem) => {
      if (!canInteract) return;
      try {
        if (e?.cancelable) e.preventDefault();
      } catch {}
      const { x, y } = getClientXY(e);
      try {
        if (
          typeof e?.pointerId === "number" &&
          (e.currentTarget as HTMLElement)?.setPointerCapture
        ) {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
      } catch {}
      setDragItemId(item.id);
      dragValueRef.current = item.value;
      dragSentenceIdRef.current = item.sentenceId;
      setDragXY({ x, y });
      try {
        const rect = (
          e.currentTarget as HTMLElement
        )?.getBoundingClientRect?.();
        if (rect)
          grabOffsetRef.current = { dx: x - rect.left, dy: y - rect.top };
      } catch {}
    },
    [canInteract],
  );

  useEffect(() => {
    if (!dragItemId) return;
    let ended = false;
    const move = (e: any) => {
      try {
        if (e?.cancelable) e.preventDefault();
      } catch {}
      const { x, y } = getClientXY(e);
      setDragXY({ x, y });
    };
    const finish = (e: any) => {
      if (ended) return;
      ended = true;
      const { x, y } = getClientXY(e);
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      const drop = el?.closest?.("[data-gap-drop='1']") as HTMLElement | null;
      const sentenceId = drop?.dataset?.sentenceId || "";
      const slotIndex = Number(drop?.dataset?.slotIndex);
      const answerKey = drop?.dataset?.answerKey || "";
      const dragSentenceId = dragSentenceIdRef.current;

      if (
        answerKey &&
        sentenceId &&
        sentenceId === dragSentenceId &&
        Number.isFinite(slotIndex)
      ) {
        const sentence = sentencesById.get(sentenceId);
        const expected = sentence?.tokens?.[slotIndex];
        const word = dragValueRef.current;
        const currentStatus = answersRef.current?.[answerKey]?.status;
        // Don't overwrite an already-correct slot
        if (currentStatus !== "correct" && expected) {
          const ok =
            normalizeUnscrambleToken(expected.value) ===
            normalizeUnscrambleToken(word);
          setAnswer(
            answerKey,
            word,
            ok ? "correct" : "incorrect",
            ok ? dragItemId : undefined,
          );
          if (ok) {
            setPools((prev) => {
              const next = new Map(prev);
              const list = (next.get(sentenceId) || []).map((p) =>
                p.id === dragItemId ? { ...p, used: true } : p,
              );
              next.set(sentenceId, list);
              return next;
            });
          }
        }
      }
      setDragItemId(null);
    };
    window.addEventListener("pointermove", move, { passive: false } as any);
    window.addEventListener("pointerup", finish, { passive: true } as any);
    window.addEventListener("pointercancel", finish, { passive: true } as any);
    window.addEventListener(
      "touchmove",
      move as any,
      { passive: false } as any,
    );
    window.addEventListener(
      "touchend",
      finish as any,
      { passive: false } as any,
    );
    window.addEventListener(
      "touchcancel",
      finish as any,
      { passive: false } as any,
    );
    return () => {
      window.removeEventListener("pointermove", move as any);
      window.removeEventListener("pointerup", finish as any);
      window.removeEventListener("pointercancel", finish as any);
      window.removeEventListener("touchmove", move as any);
      window.removeEventListener("touchend", finish as any);
      window.removeEventListener("touchcancel", finish as any);
    };
  }, [dragItemId, sentencesById, setAnswer]);

  const image = (data as any)?.images?.[0];

  return (
    <div className={`${styles.root} exercise-view-shell`}>
      <div
        className={`py-4 sm:py-5 md:py-6 w-full max-w-[900px] mx-auto exercise-view-head`}
      >
        {!!data?.title && (
          <p
            className="exercise-view-title lg:text-[34px]"
            style={{
              color: (data as any)?.titleColor || "#3F28C6",
            }}
          >
            {data.title}
          </p>
        )}
        {!!data?.subtitle && (
          <p className="exercise-view-subtitle">{data.subtitle}</p>
        )}
        {!!data?.description && (
          <p className="exercise-view-desc text-[17px] lg:text-[18px]">
            {data.description}
          </p>
        )}
      </div>

      {!!image?.dataURL && (
        <div className="w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}

      <Card className={styles.card}>
        {sentences.map((sentence) => {
          const pool = pools.get(sentence.id) || [];
          const available = pool.filter((i) => !i.used);
          return (
            <div key={sentence.id} className={styles.sentenceBlock}>
              {!!available.length && (
                <div className={styles.pool}>
                  {available.map((i) => {
                    const chip = (
                      <Chip
                        color="primary"
                        className={`exercise-chip cursor-pointer select-none ${styles.draggableChip} ${poolChipSizeClass(i.value)}`}
                        onPointerDown={(e) => onPointerDownChip(e, i)}
                      >
                        {i.value}
                      </Chip>
                    );
                    const showChipHint =
                      isTeacher &&
                      !isPresentationMode &&
                      !canInteract &&
                      !!i.value;
                    if (!showChipHint) {
                      return (
                        <span
                          key={i.id}
                          className={`inline-flex ${styles.poolChipWrapper}`}
                        >
                          {chip}
                        </span>
                      );
                    }
                    return (
                      <ResponsiveTooltip
                        key={i.id}
                        content={<div>{i.value}</div>}
                      >
                        <span
                          className={`inline-flex ${styles.poolChipWrapper}`}
                        >
                          {chip}
                        </span>
                      </ResponsiveTooltip>
                    );
                  })}
                </div>
              )}

              <div className={styles.slots}>
                {(sentence.tokens || []).map((token, slotIndex) => {
                  const answerKey = slotAnswerKey(sentence.id, slotIndex);
                  const currentRaw = String(
                    answersRef.current?.[answerKey]?.value || "",
                  );
                  const current = currentRaw.trim();
                  const status = statusBySlot?.[answerKey] || "neutral";
                  const tooltipContent = token.value || "";
                  const teacherHintActive =
                    isTeacher &&
                    !isPresentationMode &&
                    !!tooltipContent &&
                    !canInteract;
                  const tooltipDisabled =
                    !isTeacher || isPresentationMode || !tooltipContent;

                  return (
                    <ResponsiveTooltip
                      key={answerKey}
                      isDisabled={tooltipDisabled}
                      content={<div>{tooltipContent}</div>}
                    >
                      <span className="relative inline-flex">
                        <span
                          data-gap-drop="1"
                          data-sentence-id={sentence.id}
                          data-slot-index={slotIndex}
                          data-answer-key={answerKey}
                          className={`${styles.gapDrop} ${
                            status === "incorrect"
                              ? styles.gapDropIncorrect
                              : current
                                ? styles.gapDropFilled
                                : ""
                          }`}
                        >
                          <span>{current || "\u00A0"}</span>
                        </span>
                        {teacherHintActive && (
                          <span
                            className="pointer-events-auto absolute inset-0 z-10 cursor-help rounded-full"
                            aria-hidden
                          />
                        )}
                      </span>
                    </ResponsiveTooltip>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!!dragItemId &&
          !!portalRef.current &&
          createPortal(
            <div
              className={styles.dragGhost}
              style={{
                transform: `translate3d(${dragXY.x - grabOffsetRef.current.dx}px, ${dragXY.y - grabOffsetRef.current.dy}px, 0)`,
              }}
            >
              <Chip
                color="primary"
                className={`exercise-chip ${styles.draggableChip} ${poolChipSizeClass(dragValueRef.current || "")}`}
              >
                {dragValueRef.current}
              </Chip>
            </div>,
            portalRef.current,
          )}
      </Card>
      {/* keep answersVersion referenced for re-renders of slot text via answersRef */}
      <span className="hidden" aria-hidden>
        {answersVersion}
      </span>
    </div>
  );
};

export const UnscrambleWordsExView = memo(UnscrambleWordsExViewImpl);
