import pLimit from "p-limit";
import { fetchGet, fetchPostJson } from "@/api";
import { useCallback, useEffect, useRef, useState } from "react";

type TParams = {
  student_id?: number;
  lesson_id: number;
  ex_id: number;
  isTeacher?: boolean;
  activeStudentId?: number;
  sleepDelay?: number;
  isPresentationMode?: boolean;
  /** When false, skip background polling (still allows getAnswers / writeAnswer). */
  enablePolling?: boolean;
  /**
   * When true, student poll also pushes remote answers into React state.
   * Needed for live teacher corrections (e.g. free-input rich edits).
   * Callers must ignore remote updates while the field is focused.
   */
  syncRemoteToStudent?: boolean;
};

const limit = pLimit(1);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Reserved backend q_id for reset fence — never treat as exercise answer. */
export const ANSWER_SYNC_Q_ID = "__sync__";

export const EX_ANSWERS_RESET_EVENT = "ex-answers-reset";

/** Teachers need live sync; students need timely reset detection. */
export const DEFAULT_TEACHER_POLL_MS = 5000;
export const DEFAULT_STUDENT_POLL_MS = 7000;

export type TExAnswersResetDetail = {
  ex_id: number;
  student_id: number;
  lesson_id: number;
  sync_v?: number;
};

export const dispatchAnswersReset = (detail: TExAnswersResetDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EX_ANSWERS_RESET_EVENT, { detail }));
};

const parseSyncVersion = (raw: unknown): number => {
  if (raw == null) return 0;
  try {
    const parsed =
      typeof raw === "string" ? JSON.parse(raw || "{}") : (raw as { v?: number });
    const v = Number(parsed?.v);
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
};

const splitAnswerRows = (data: any[]) => {
  const answersMap: Record<string, any> = {};
  let sync_v = 0;
  (data || []).forEach((obj) => {
    if (obj == null || obj.q_id == null) return;
    if (String(obj.q_id) === ANSWER_SYNC_Q_ID) {
      sync_v = Math.max(sync_v, parseSyncVersion(obj.answer));
      return;
    }
    answersMap[obj.q_id] = obj;
  });
  return { answersMap, sync_v };
};

const answersSignature = (answersMap: Record<string, any>, sync_v: number) => {
  const keys = Object.keys(answersMap).sort();
  const body = keys
    .map((k) => `${k}:${answersMap[k]?.answer ?? ""}`)
    .join("|");
  return `v${sync_v}|${body}`;
};

type SharedPollListener = {
  id: number;
  isTeacher: boolean;
  intervalMs: number;
  onTick: (
    answersMap: Record<string, any>,
    targetStudentId: number,
    sync_v: number
  ) => void;
};

type SharedPoller = {
  key: string;
  lesson_id: number;
  ex_id: number;
  targetStudentId: number;
  listeners: Map<number, SharedPollListener>;
  intervalMs: number;
  cancelled: boolean;
  visible: boolean;
  observer: IntersectionObserver | null;
  targetEl: HTMLElement | null;
  gen: number;
};

const sharedPollers = new Map<string, SharedPoller>();
let listenerIdSeq = 0;

const pollerKey = (
  lesson_id: number,
  ex_id: number,
  targetStudentId: number
) => `${lesson_id}:${ex_id}:${targetStudentId}`;

const inflightFetches = new Map<
  string,
  Promise<{ answersMap: Record<string, any>; sync_v: number }>
>();

const fetchAnswersMapShared = async (
  lesson_id: number,
  ex_id: number,
  targetStudentId: number
) => {
  const key = pollerKey(lesson_id, ex_id, targetStudentId);
  const existing = inflightFetches.get(key);
  if (existing) return existing;

  const promise = (async () => {
    let reqStr = `/answer?lesson_id=${lesson_id}&ex_id=${ex_id}`;
    if (targetStudentId) {
      reqStr += `&student_id=${targetStudentId}`;
    }
    const res = await fetchGet({
      path: reqStr,
      isSecure: true,
    });
    const data = (await res?.json()) || [];
    return splitAnswerRows(Array.isArray(data) ? data : []);
  })().finally(() => {
    inflightFetches.delete(key);
  });

  inflightFetches.set(key, promise);
  return promise;
};

const minListenerInterval = (poller: SharedPoller) => {
  let min = Number.POSITIVE_INFINITY;
  poller.listeners.forEach((l) => {
    if (l.intervalMs < min) min = l.intervalMs;
  });
  return Number.isFinite(min) ? min : DEFAULT_STUDENT_POLL_MS;
};

const ensurePollLoop = (poller: SharedPoller) => {
  const myGen = ++poller.gen;
  const loop = async () => {
    while (!poller.cancelled && poller.gen === myGen) {
      if (poller.visible && poller.listeners.size > 0) {
        try {
          const { answersMap, sync_v } = await fetchAnswersMapShared(
            poller.lesson_id,
            poller.ex_id,
            poller.targetStudentId
          );
          if (poller.cancelled || poller.gen !== myGen) return;
          poller.listeners.forEach((listener) => {
            try {
              listener.onTick(answersMap, poller.targetStudentId, sync_v);
            } catch {}
          });
        } catch {}
      }
      const delay = Math.max(
        500,
        minListenerInterval(poller) || poller.intervalMs
      );
      poller.intervalMs = delay;
      await sleep(delay);
    }
  };
  void loop();
};

const attachVisibility = (poller: SharedPoller) => {
  if (typeof document === "undefined") return;
  try {
    poller.observer?.disconnect();
  } catch {}
  poller.observer = null;

  const target = document.getElementById(`ex-${poller.ex_id}`);
  poller.targetEl = target;
  if (!target) {
    // Exercise not in DOM yet — allow one fetch; re-attach on next subscribe.
    poller.visible = true;
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        poller.visible = entry.isIntersecting;
      });
    },
    {
      root: null,
      // Prefetch answers slightly before the exercise enters the viewport
      rootMargin: "240px 0px",
    }
  );
  observer.observe(target);
  poller.observer = observer;

  const rect = target.getBoundingClientRect();
  const margin = 240;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const inView = rect.bottom > -margin && rect.top < vh + margin;
  poller.visible = inView;
};

/**
 * Push empty answers to active local poll listeners and broadcast remount event.
 * Used after a successful /answer/reset so teacher UI clears without waiting for the next poll.
 */
let suppressResetEvent = false;

export const notifyLocalAnswersReset = (detail: TExAnswersResetDetail) => {
  const key = pollerKey(
    Number(detail.lesson_id),
    Number(detail.ex_id),
    Number(detail.student_id)
  );
  const poller = sharedPollers.get(key);
  suppressResetEvent = true;
  try {
    if (poller) {
      poller.listeners.forEach((listener) => {
        try {
          listener.onTick({}, poller.targetStudentId, detail.sync_v || 0);
        } catch {}
      });
    }
  } finally {
    suppressResetEvent = false;
  }
  // Single remount signal for ExList (teacher/student local UI).
  dispatchAnswersReset(detail);
};

const subscribeSharedPoller = (opts: {
  lesson_id: number;
  ex_id: number;
  targetStudentId: number;
  isTeacher: boolean;
  intervalMs: number;
  onTick: (
    answersMap: Record<string, any>,
    targetStudentId: number,
    sync_v: number
  ) => void;
}) => {
  const key = pollerKey(opts.lesson_id, opts.ex_id, opts.targetStudentId);
  let poller = sharedPollers.get(key);
  const id = ++listenerIdSeq;

  if (!poller) {
    poller = {
      key,
      lesson_id: opts.lesson_id,
      ex_id: opts.ex_id,
      targetStudentId: opts.targetStudentId,
      listeners: new Map(),
      intervalMs: opts.intervalMs,
      cancelled: false,
      visible: false,
      observer: null,
      targetEl: null,
      gen: 0,
    };
    sharedPollers.set(key, poller);
    attachVisibility(poller);
    ensurePollLoop(poller);
  } else if (!poller.targetEl || !document.getElementById(`ex-${opts.ex_id}`)) {
    attachVisibility(poller);
  } else if (!poller.observer) {
    attachVisibility(poller);
  }

  const listener: SharedPollListener = {
    id,
    isTeacher: opts.isTeacher,
    onTick: opts.onTick,
    intervalMs: opts.intervalMs,
  };
  poller.listeners.set(id, listener);
  poller.intervalMs = minListenerInterval(poller);

  return () => {
    const p = sharedPollers.get(key);
    if (!p) return;
    p.listeners.delete(id);
    if (p.listeners.size === 0) {
      p.cancelled = true;
      p.gen += 1;
      try {
        if (p.targetEl && p.observer) p.observer.unobserve(p.targetEl);
        p.observer?.disconnect();
      } catch {}
      sharedPollers.delete(key);
    } else {
      p.intervalMs = minListenerInterval(p);
    }
  };
};

export const useExAnswer = (params: TParams) => {
  const {
    student_id,
    lesson_id,
    ex_id,
    isTeacher,
    activeStudentId,
    sleepDelay,
    isPresentationMode,
    enablePolling = true,
    syncRemoteToStudent = false,
  } = params;
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [syncVersion, setSyncVersion] = useState(0);
  const [resetSeq, setResetSeq] = useState(0);
  const lastSignatureRef = useRef<string | null>(null);
  const lastTargetRef = useRef<number>(0);
  const lastSyncVRef = useRef(0);
  const writeGenRef = useRef(0);
  const syncVersionRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      writeGenRef.current += 1;
    };
  }, []);

  const bumpWriteGen = useCallback(() => {
    writeGenRef.current += 1;
  }, []);

  const writeAnswer = useCallback(
    async (q_id: number | string, answer: string) => {
      const targetStudentId = Number(
        isTeacher ? activeStudentId || 0 : student_id || 0
      );
      if (!targetStudentId) {
        return { ok: false as const, stale: false };
      }
      if (String(q_id) === ANSWER_SYNC_Q_ID) {
        return { ok: false as const, stale: false };
      }

      const genAtStart = writeGenRef.current;
      const sync_v = syncVersionRef.current;

      try {
        const res = await limit(() =>
          fetchPostJson({
            path: "/answer",
            isSecure: true,
            data: {
              lesson_id,
              ex_id,
              q_id,
              answer,
              student_id: targetStudentId,
              sync_v,
            },
          })
        );

        if (!mountedRef.current || writeGenRef.current !== genAtStart) {
          return { ok: false as const, stale: true };
        }

        const data = await res?.json?.().catch?.(() => null);
        if (data?.stale || res?.status === 409) {
          const nextSync =
            Number(data?.sync_v) > 0
              ? Number(data.sync_v)
              : syncVersionRef.current;
          syncVersionRef.current = nextSync;
          lastSyncVRef.current = nextSync;
          setSyncVersion(nextSync);
          setAnswers({});
          lastSignatureRef.current = answersSignature({}, nextSync);
          bumpWriteGen();
          setResetSeq((n) => n + 1);
          dispatchAnswersReset({
            ex_id: Number(ex_id),
            student_id: targetStudentId,
            lesson_id: Number(lesson_id),
            sync_v: nextSync,
          });
          return { ok: false as const, stale: true };
        }

        if (mountedRef.current && writeGenRef.current === genAtStart) {
          setAnswers((prev) => {
            const next = {
              ...prev,
              [String(q_id)]: {
                ...(prev[String(q_id)] || {}),
                q_id,
                answer,
              },
            };
            lastSignatureRef.current = answersSignature(
              next,
              syncVersionRef.current
            );
            return next;
          });
        }

        return { ok: true as const, stale: false };
      } catch {
        return { ok: false as const, stale: false };
      }
    },
    [
      lesson_id,
      ex_id,
      student_id,
      isTeacher,
      activeStudentId,
      bumpWriteGen,
    ]
  );

  const applyAnswers = useCallback(
    (
      answersMap: Record<string, any>,
      targetStudentId: number,
      sync_v: number,
      options?: { updateState?: boolean; detectReset?: boolean }
    ) => {
      if (!mountedRef.current) {
        return answersMap;
      }

      const updateState = options?.updateState !== false;
      const detectReset = options?.detectReset !== false;
      const nextSig = answersSignature(answersMap, sync_v);
      const prevSig = lastSignatureRef.current;
      const sameTarget = lastTargetRef.current === targetStudentId;
      const prevSync = lastSyncVRef.current;
      const syncBumped = sync_v > 0 && sync_v !== prevSync && sameTarget;

      // Switching student: never treat as a reset of the previous student.
      if (!sameTarget) {
        lastTargetRef.current = targetStudentId;
        lastSignatureRef.current = nextSig;
        lastSyncVRef.current = sync_v;
        syncVersionRef.current = sync_v;
        setSyncVersion(sync_v);
        if (updateState) {
          setAnswers(answersMap);
        }
        return answersMap;
      }

      if (prevSig === nextSig && !syncBumped) {
        return answersMap;
      }

      // Signature is `vN|body` — empty answers have an empty body.
      const prevBody = (prevSig || "").split("|").slice(1).join("|");
      const prevHadRealAnswers = !!prevBody;
      const nextHasAnswers = Object.keys(answersMap).length > 0;

      lastSignatureRef.current = nextSig;
      lastSyncVRef.current = sync_v;
      syncVersionRef.current = sync_v;
      setSyncVersion(sync_v);

      if (updateState) {
        setAnswers(answersMap);
      }

      const shouldReset =
        detectReset &&
        !suppressResetEvent &&
        targetStudentId &&
        (syncBumped || (prevHadRealAnswers && !nextHasAnswers));

      if (shouldReset) {
        if (!updateState) {
          setAnswers({});
        }
        bumpWriteGen();
        setResetSeq((n) => n + 1);
        dispatchAnswersReset({
          ex_id: Number(ex_id),
          student_id: targetStudentId,
          lesson_id: Number(lesson_id),
          sync_v,
        });
      }

      return answersMap;
    },
    [ex_id, lesson_id, bumpWriteGen]
  );

  const fetchAnswersMap = useCallback(async () => {
    const targetStudentId = Number(activeStudentId || student_id || 0);
    const { answersMap, sync_v } = await fetchAnswersMapShared(
      Number(lesson_id),
      Number(ex_id),
      targetStudentId
    );
    return {
      answersMap,
      targetStudentId,
      sync_v,
    };
  }, [activeStudentId, student_id, lesson_id, ex_id]);

  const getAnswers = useCallback(
    async (_once?: boolean) => {
      if (isPresentationMode) {
        return;
      }
      const { answersMap, targetStudentId, sync_v } = await fetchAnswersMap();
      if (!mountedRef.current) {
        return answersMap;
      }
      // Explicit loads always hydrate local state (initial student/teacher load).
      return applyAnswers(answersMap, targetStudentId, sync_v, {
        updateState: true,
        detectReset: false,
      });
    },
    [isPresentationMode, fetchAnswersMap, applyAnswers]
  );

  useEffect(() => {
    const onAnswersReset = (event: Event) => {
      const detail = (event as CustomEvent<TExAnswersResetDetail>).detail;
      if (!detail) return;
      const targetStudentId = Number(activeStudentId || student_id || 0);
      if (
        Number(detail.ex_id) === Number(ex_id) &&
        Number(detail.student_id) === targetStudentId &&
        Number(detail.lesson_id) === Number(lesson_id)
      ) {
        bumpWriteGen();
        const nextSync =
          detail.sync_v && detail.sync_v > 0
            ? detail.sync_v
            : syncVersionRef.current;
        syncVersionRef.current = nextSync;
        lastSyncVRef.current = nextSync;
        lastSignatureRef.current = answersSignature({}, nextSync);
        setSyncVersion(nextSync);
        setAnswers({});
        setResetSeq((n) => n + 1);
      }
    };
    window.addEventListener(EX_ANSWERS_RESET_EVENT, onAnswersReset);
    return () => {
      window.removeEventListener(EX_ANSWERS_RESET_EVENT, onAnswersReset);
    };
  }, [activeStudentId, student_id, ex_id, lesson_id, bumpWriteGen]);

  useEffect(() => {
    const targetStudentId = Number(activeStudentId || student_id || 0);
    const shouldPoll =
      enablePolling &&
      !isPresentationMode &&
      !!targetStudentId &&
      (isTeacher || !!student_id);

    // Student switched (teacher) or target cleared — drop previous answers immediately
    // so UI never shows the previous student's data.
    if (lastTargetRef.current && lastTargetRef.current !== targetStudentId) {
      lastSignatureRef.current = null;
      lastSyncVRef.current = 0;
      syncVersionRef.current = 0;
      setSyncVersion(0);
      setAnswers({});
      bumpWriteGen();
    }
    if (!targetStudentId) {
      lastTargetRef.current = 0;
      lastSignatureRef.current = null;
      lastSyncVRef.current = 0;
      syncVersionRef.current = 0;
      setSyncVersion(0);
      setAnswers({});
      return;
    }

    if (!shouldPoll) {
      return;
    }

    const intervalMs =
      sleepDelay ||
      (isTeacher ? DEFAULT_TEACHER_POLL_MS : DEFAULT_STUDENT_POLL_MS);

    let cancelled = false;

    // Immediate hydrate (teacher selecting a student / remount after reset)
    // so answers appear without waiting for the first poll tick.
    void (async () => {
      try {
        const {
          answersMap,
          targetStudentId: sid,
          sync_v,
        } = await fetchAnswersMap();
        if (cancelled || !mountedRef.current) return;
        applyAnswers(answersMap, sid, sync_v, {
          updateState: true,
          detectReset: false,
        });
      } catch {}
    })();

    const unsubscribe = subscribeSharedPoller({
      lesson_id: Number(lesson_id),
      ex_id: Number(ex_id),
      targetStudentId,
      isTeacher: !!isTeacher,
      intervalMs,
      onTick: (answersMap, sid, sync_v) => {
        if (!mountedRef.current) return;
        if (isTeacher) {
          applyAnswers(answersMap, sid, sync_v, {
            updateState: true,
            detectReset: true,
          });
        } else {
          // Student: by default only watch for remote reset (don't steal focus).
          // syncRemoteToStudent: also hydrate state for live teacher corrections.
          applyAnswers(answersMap, sid, sync_v, {
            updateState: syncRemoteToStudent,
            detectReset: true,
          });
        }
      },
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    isTeacher,
    activeStudentId,
    student_id,
    ex_id,
    lesson_id,
    isPresentationMode,
    sleepDelay,
    enablePolling,
    syncRemoteToStudent,
    applyAnswers,
    fetchAnswersMap,
    bumpWriteGen,
  ]);

  return {
    writeAnswer,
    answers,
    getAnswers,
    setAnswers,
    syncVersion,
    resetSeq,
  };
};
