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
};

const limit = pLimit(1);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const EX_ANSWERS_RESET_EVENT = "ex-answers-reset";

export type TExAnswersResetDetail = {
  ex_id: number;
  student_id: number;
  lesson_id: number;
};

const dispatchAnswersReset = (detail: TExAnswersResetDetail) => {
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

export const useExAnswer = (params: TParams) => {
  const {
    student_id,
    lesson_id,
    ex_id,
    isTeacher,
    activeStudentId,
    sleepDelay,
    isPresentationMode,
  } = params;
  const queue = useRef<Promise<Response>[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const visibleTargetRef = useRef(0);
  const lastSignatureRef = useRef<string | null>(null);
  const pollGenRef = useRef(0);
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
    let reqStr = `/answer?lesson_id=${lesson_id}&ex_id=${ex_id}`;
    if (targetStudentId) {
      reqStr += `&student_id=${targetStudentId}`;
    }
    const res = await fetchGet({
      path: reqStr,
      isSecure: true,
    });
    const data = (await res?.json()) || [];
    return {
      answersMap: toAnswersMap(data),
      targetStudentId,
    };
  }, [activeStudentId, student_id, lesson_id, ex_id]);

  const getAnswers = useCallback(
    async (once?: boolean) => {
      if (isPresentationMode) {
        return;
      }
      const { answersMap, targetStudentId } = await fetchAnswersMap();
      if (!mountedRef.current) {
        return answersMap;
      }
      // Explicit loads always hydrate local state (initial student load).
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
      !isPresentationMode &&
      !!targetStudentId &&
      (isTeacher || !!student_id);

    const myGen = ++pollGenRef.current;
    visibleTargetRef.current = 0;

    if (!shouldPoll) {
      return;
    }

    let cancelled = false;

    const pollLoop = async () => {
      while (!cancelled && pollGenRef.current === myGen) {
        if (visibleTargetRef.current === targetStudentId) {
          try {
            const { answersMap } = await fetchAnswersMap();
            if (
              cancelled ||
              pollGenRef.current !== myGen ||
              !mountedRef.current
            ) {
              return;
            }
            if (isTeacher) {
              // Teacher: live-sync answers into UI.
              applyAnswers(answersMap, targetStudentId, {
                updateState: true,
                detectReset: true,
              });
            } else {
              // Student: only watch for remote reset. Do NOT push poll data into
              // React state — that remounts inputs and steals focus while typing.
              applyAnswers(answersMap, targetStudentId, {
                updateState: false,
                detectReset: true,
              });
            }
          } catch (err) {}
        }
        await sleep(sleepDelay || 1000);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleTargetRef.current = entry.isIntersecting
            ? targetStudentId
            : 0;
        });
      },
      {
        root: null,
        rootMargin: "0px",
      }
    );

    const target = document.getElementById(`ex-${ex_id}`);
    if (target) {
      observer.observe(target);
      const rect = target.getBoundingClientRect();
      const inView =
        rect.bottom > 0 &&
        rect.top <
          (window.innerHeight || document.documentElement.clientHeight);
      if (inView) {
        visibleTargetRef.current = targetStudentId;
      }
    }

    pollLoop();

    return () => {
      cancelled = true;
      pollGenRef.current += 1;
      visibleTargetRef.current = 0;
      try {
        if (target) observer.unobserve(target);
        observer.disconnect();
      } catch (err) {}
    };
  }, [
    isTeacher,
    activeStudentId,
    student_id,
    ex_id,
    isPresentationMode,
    sleepDelay,
    fetchAnswersMap,
    applyAnswers,
  ]);

  return { writeAnswer, answers, getAnswers, setAnswers };
};
