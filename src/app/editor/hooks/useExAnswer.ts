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
};

const limit = pLimit(1);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const EX_ANSWERS_RESET_EVENT = "ex-answers-reset";

/** Teachers need live sync; students mainly need reset detection. */
export const DEFAULT_TEACHER_POLL_MS = 2000;
export const DEFAULT_STUDENT_POLL_MS = 5000;

export type TExAnswersResetDetail = {
  ex_id: number;
  student_id: number;
  lesson_id: number;
};

export const dispatchAnswersReset = (detail: TExAnswersResetDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EX_ANSWERS_RESET_EVENT, { detail }));
};

const toAnswersMap = (data: any[]) =>
  (data || []).reduce(function (map, obj) {
    map[obj.q_id] = obj;
    return map;
  }, {} as Record<string, any>);

const answersSignature = (answersMap: Record<string, any>) => {
  const keys = Object.keys(answersMap).sort();
  return keys
    .map((k) => `${k}:${answersMap[k]?.answer ?? ""}`)
    .join("|");
};

type SharedPollListener = {
  id: number;
  isTeacher: boolean;
  intervalMs: number;
  onTick: (answersMap: Record<string, any>, targetStudentId: number) => void;
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

const inflightFetches = new Map<string, Promise<Record<string, any>>>();

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
    return toAnswersMap(data);
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
          const answersMap = await fetchAnswersMapShared(
            poller.lesson_id,
            poller.ex_id,
            poller.targetStudentId
          );
          if (poller.cancelled || poller.gen !== myGen) return;
          poller.listeners.forEach((listener) => {
            try {
              listener.onTick(answersMap, poller.targetStudentId);
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
  const inView =
    rect.bottom > -margin && rect.top < vh + margin;
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
          listener.onTick({}, poller.targetStudentId);
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
  onTick: (answersMap: Record<string, any>, targetStudentId: number) => void;
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
  } = params;
  const queue = useRef<Promise<Response>[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const lastSignatureRef = useRef<string | null>(null);
  const lastTargetRef = useRef<number>(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const writeAnswer = useCallback(
    async (q_id: number | string, answer: string) => {
      if (!student_id) {
        return;
      }
      queue.current.push(
        limit(() =>
          fetchPostJson({
            path: "/answer",
            isSecure: true,
            data: {
              lesson_id,
              ex_id,
              q_id,
              answer,
              student_id,
            },
          })
        )
      );
      await Promise.all(queue.current);
    },
    [lesson_id, ex_id, student_id]
  );

  const applyAnswers = useCallback(
    (
      answersMap: Record<string, any>,
      targetStudentId: number,
      options?: { updateState?: boolean; detectReset?: boolean }
    ) => {
      if (!mountedRef.current) {
        return answersMap;
      }

      const updateState = options?.updateState !== false;
      const detectReset = options?.detectReset !== false;
      const nextSig = answersSignature(answersMap);
      const prevSig = lastSignatureRef.current;
      const sameTarget = lastTargetRef.current === targetStudentId;

      // Switching student: never treat as a reset of the previous student.
      if (!sameTarget) {
        lastTargetRef.current = targetStudentId;
        lastSignatureRef.current = nextSig;
        if (updateState) {
          setAnswers(answersMap);
        }
        return answersMap;
      }

      if (prevSig === nextSig) {
        return answersMap;
      }

      const prevHadAnswers = !!prevSig;
      const nextHasAnswers = Object.keys(answersMap).length > 0;

      lastSignatureRef.current = nextSig;

      if (updateState) {
        setAnswers(answersMap);
      }

      if (
        detectReset &&
        !suppressResetEvent &&
        prevHadAnswers &&
        !nextHasAnswers &&
        targetStudentId
      ) {
        if (!updateState) {
          setAnswers({});
        }
        dispatchAnswersReset({
          ex_id: Number(ex_id),
          student_id: targetStudentId,
          lesson_id: Number(lesson_id),
        });
      }

      return answersMap;
    },
    [ex_id, lesson_id]
  );

  const fetchAnswersMap = useCallback(async () => {
    const targetStudentId = Number(activeStudentId || student_id || 0);
    const answersMap = await fetchAnswersMapShared(
      Number(lesson_id),
      Number(ex_id),
      targetStudentId
    );
    return {
      answersMap,
      targetStudentId,
    };
  }, [activeStudentId, student_id, lesson_id, ex_id]);

  const getAnswers = useCallback(
    async (_once?: boolean) => {
      if (isPresentationMode) {
        return;
      }
      const { answersMap, targetStudentId } = await fetchAnswersMap();
      if (!mountedRef.current) {
        return answersMap;
      }
      // Explicit loads always hydrate local state (initial student/teacher load).
      return applyAnswers(answersMap, targetStudentId, {
        updateState: true,
        detectReset: false,
      });
    },
    [isPresentationMode, fetchAnswersMap, applyAnswers]
  );

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
      setAnswers({});
    }
    if (!targetStudentId) {
      lastTargetRef.current = 0;
      lastSignatureRef.current = null;
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
        const { answersMap, targetStudentId: sid } = await fetchAnswersMap();
        if (cancelled || !mountedRef.current) return;
        applyAnswers(answersMap, sid, {
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
      onTick: (answersMap, sid) => {
        if (!mountedRef.current) return;
        if (isTeacher) {
          applyAnswers(answersMap, sid, {
            updateState: true,
            detectReset: true,
          });
        } else {
          // Student: only watch for remote reset. Do NOT push poll data into
          // React state — that remounts inputs and steals focus while typing.
          applyAnswers(answersMap, sid, {
            updateState: false,
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
    applyAnswers,
    fetchAnswersMap,
  ]);

  return { writeAnswer, answers, getAnswers, setAnswers };
};
