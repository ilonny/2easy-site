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

export const useExAnswer = (params: TParams) => {
  let idRef = 0;
  const {
    student_id,
    lesson_id,
    ex_id,
    isTeacher,
    activeStudentId,
    sleepDelay,
    isPresentationMode,
  } = params;
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
      if (isPresentationMode) {
        return;
      }
      if (!once && (!isTeacher || !activeStudentId || !idRef)) {
        return;
      }
      let reqStr = `/answer?lesson_id=${lesson_id}&ex_id=${ex_id}`;
      if (activeStudentId || student_id) {
        reqStr += `&student_id=${activeStudentId || student_id}`;
      }
      const res = await fetchGet({
        path: reqStr,
        isSecure: true,
      });

      const data = (await res?.json()) || [];
      const answersMap = data?.reduce(function (map, obj) {
        map[obj.q_id] = obj;
        return map;
      }, {});
      setAnswers(answersMap);
      if (!once) {
        await sleep(sleepDelay || 1000);
        getAnswers();
        return;
      }
      return answersMap;
    },
    [
      isTeacher,
      activeStudentId,
      lesson_id,
      ex_id,
      student_id,
      sleepDelay,
      isPresentationMode,
      idRef,
    ]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            idRef = activeStudentId || 0;
            if (activeStudentId) {
              getAnswers();
            }
            // // console.log(`Элемент ex-${ex_id} появился в поле зрения`);
          } else {
            idRef = 0;
            // // console.log(`Элемент ex-${ex_id} исчез из поля зрения`);
          }
        });
      },
      {
        root: null, // Следим за видимостью относительно viewport (окна браузера)
        rootMargin: "0px", // Не добавляем отступы
        // threshold: 0, // Элемент должен быть виден хотя бы на 0%
      }
    );

    const target = document.getElementById(`ex-${ex_id}`);

    if (target) {
      observer.observe(target);
    }

    return () => {
      try {
        observer?.unobserve(target);
        observer?.disconnect(); //отключает все наблюдаемые элементы.
      } catch (err) {}

      idRef = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher, activeStudentId, getAnswers]);

  return { writeAnswer, answers, getAnswers, setAnswers };
};
