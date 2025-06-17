import pLimit from "p-limit";
import { fetchGet, fetchPostJson } from "@/api";
import { useCallback, useEffect, useRef, useState } from "react";

type TParams = {
  student_id?: number;
  lesson_id: number;
  ex_id: number;
  isTeacher?: boolean;
  activeStudentId?: number;
};

const limit = pLimit(1);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let idRef = 0;

export const useExAnswer = (params: TParams) => {
  const { student_id, lesson_id, ex_id, isTeacher, activeStudentId } = params;
  // const [activeStudentId, setActiveStudentId] = useState(0);
  const queue = useRef<Promise<Response>[]>([]);
  const [answers, setAnswers] = useState({});

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
    [lesson_id, ex_id]
  );

  const getAnswers = useCallback(
    async (once?: boolean) => {
      if (!once && (!isTeacher || !activeStudentId || !idRef)) {
        return;
      }
      const res = await fetchGet({
        path: `/answer?lesson_id=${lesson_id}&ex_id=${ex_id}&student_id=${
          activeStudentId || student_id
        }`,
        isSecure: true,
      });

      const data = (await res?.json()) || [];
      const answersMap = data?.reduce(function (map, obj) {
        map[obj.q_id] = obj;
        return map;
      }, {});
      setAnswers(answersMap);
      if (!once) {
        await sleep(1000);
        getAnswers();
        return;
      }
      return answersMap;
    },
    [lesson_id, ex_id, student_id, isTeacher, activeStudentId]
  );

  useEffect(() => {
    idRef = activeStudentId || 0;
    if (activeStudentId) {
      getAnswers();
    }
    return () => {
      idRef = 0;
    };
  }, [isTeacher, activeStudentId, getAnswers]);

  return { writeAnswer, answers, getAnswers, setAnswers };
};
