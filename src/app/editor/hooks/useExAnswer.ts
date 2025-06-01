import pLimit from "p-limit";
import { fetchPostJson } from "@/api";
import { useCallback, useRef } from "react";

type TParams = {
  student_id?: number;
  lesson_id: number;
  ex_id: number;
};

const limit = pLimit(1);

export const useExAnswer = (params: TParams) => {
  const { student_id, lesson_id, ex_id } = params;

  const queue = useRef<Promise<Response>[]>([]);
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

  return { writeAnswer };
};
