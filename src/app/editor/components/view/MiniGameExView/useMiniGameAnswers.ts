"use client";

import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { getExerciseAnswerAccess } from "@/app/editor/helpers/exerciseAnswerAccess";
import { AuthContext } from "@/auth";
import { useParams } from "next/navigation";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  TMiniGameAnswerState,
  TMiniGameData,
} from "../../editor/MiniGame/types";

type TArgs = {
  data: TMiniGameData;
  isPreview?: boolean;
  isView?: boolean;
  isPresentationMode?: boolean;
  activeStudentId?: number;
  /** When true, do not hydrate/persist answers (live sync owns state). */
  disablePersist?: boolean;
};

export function useMiniGameAnswers({
  data,
  isPreview = false,
  isView = false,
  isPresentationMode = false,
  activeStudentId,
  disablePersist = false,
}: TArgs) {
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const access = getExerciseAnswerAccess({
    isPreview,
    isViewMode: isView,
    isTeacher,
    isPresentationMode,
    studentId: student_id,
    activeStudentId,
  });
  const canInteract = access.canInteract;
  const shouldPersistAnswers = disablePersist
    ? false
    : access.shouldPersistAnswers;

  const [state, setState] = useState<TMiniGameAnswerState>({});
  const [version, setVersion] = useState(0);
  const stateRef = useRef<TMiniGameAnswerState>({});
  const userEditedRef = useRef(false);
  const lastHydratedRawRef = useRef("");
  const saveTimerRef = useRef<number | null>(null);

  const { writeAnswer, answers, getAnswers, resetSeq } = useExAnswer({
    student_id,
    lesson_id: lesson_id as any,
    ex_id: ex_id as any,
    activeStudentId,
    isTeacher,
    isPresentationMode,
    syncRemoteToStudent: true,
  });

  const applyState = useCallback((next: TMiniGameAnswerState) => {
    stateRef.current = next;
    setState(next);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    stateRef.current = {};
    userEditedRef.current = false;
    lastHydratedRawRef.current = "";
    setState({});
    setVersion((v) => v + 1);
  }, [resetSeq]);

  // Teacher switched student — drop in-flight local edits and re-hydrate.
  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    userEditedRef.current = false;
    lastHydratedRawRef.current = "";
    stateRef.current = {};
    setState({});
    setVersion((v) => v + 1);
  }, [activeStudentId]);

  const hydrateFromRaw = useCallback(
    (raw: string | undefined | null, opts?: { allowClear?: boolean }) => {
      if (!raw) {
        if (!opts?.allowClear) return;
        applyState({});
        lastHydratedRawRef.current = "";
        return;
      }
      if (raw === lastHydratedRawRef.current) return;
      try {
        const parsed = JSON.parse(raw) as TMiniGameAnswerState;
        applyState(parsed && typeof parsed === "object" ? parsed : {});
        lastHydratedRawRef.current = raw;
      } catch {
        // ignore
      }
    },
    [applyState],
  );

  const answerTargetId = isTeacher ? activeStudentId : student_id;

  const readAnswerRaw = useCallback(
    (map: Record<string, any> | null | undefined) => {
      if (!map || data.id == null) return undefined;
      return map?.[data.id as number]?.answer ?? map?.[String(data.id)]?.answer;
    },
    [data.id],
  );

  useEffect(() => {
    if (disablePersist || isPreview || !answerTargetId) return;
    getAnswers(true).then((a) => {
      if (userEditedRef.current) return;
      hydrateFromRaw(readAnswerRaw(a as any), { allowClear: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerTargetId, isPreview, data.id, disablePersist]);

  useEffect(() => {
    if (disablePersist || isPreview || !answers) return;
    if (!answerTargetId) return;
    if (userEditedRef.current) return;
    hydrateFromRaw(readAnswerRaw(answers as any), {
      allowClear: isTeacher,
    });
  }, [
    answers,
    hydrateFromRaw,
    isPreview,
    isTeacher,
    answerTargetId,
    readAnswerRaw,
    disablePersist,
  ]);

  const schedulePersist = useCallback(() => {
    if (!shouldPersistAnswers) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      try {
        const payload = JSON.stringify(stateRef.current);
        lastHydratedRawRef.current = payload;
        void writeAnswer(data.id as any, payload).then(() => {
          userEditedRef.current = false;
        });
      } catch {
        // ignore
      }
    }, 400);
  }, [data.id, shouldPersistAnswers, writeAnswer]);

  const writeAnswerRef = useRef(writeAnswer);
  writeAnswerRef.current = writeAnswer;
  const shouldPersistRef = useRef(shouldPersistAnswers);
  shouldPersistRef.current = shouldPersistAnswers;

  useEffect(() => {
    return () => {
      if (!saveTimerRef.current) return;
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      if (!shouldPersistRef.current) return;
      try {
        writeAnswerRef.current(
          data.id as any,
          JSON.stringify(stateRef.current),
        );
      } catch {
        // ignore
      }
    };
  }, [data.id]);

  const patchState = useCallback(
    (
      patch:
        | Partial<TMiniGameAnswerState>
        | ((prev: TMiniGameAnswerState) => TMiniGameAnswerState),
    ) => {
      if (!canInteract) return;
      const prev = stateRef.current;
      const next =
        typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      if (next === prev) return;
      userEditedRef.current = true;
      applyState(next);
      schedulePersist();
    },
    [applyState, canInteract, schedulePersist],
  );

  return {
    canInteract,
    isTeacher,
    isPresentationMode,
    state,
    stateRef,
    version,
    patchState,
    applyState,
  };
}
