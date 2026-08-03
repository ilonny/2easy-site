"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { ExList } from "@/app/editor/components/view/ExList";
import { getImageUrl } from "@/app/editor/helpers";
import { useExList } from "@/app/editor/hooks/useExList";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AuthContext } from "@/auth";
import { ContentWrapper } from "@/components";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { T } from "@/i18n/T";

export default function SharedLessonPage() {
  const { checkSubscription, hasSubscription } = useCheckSubscription();
  const { profile } = useContext(AuthContext);
  const params = useParams();

  const hash = params?.id;

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription, hasSubscription, hash]);

  const [lesson, setLesson] = useState();

  const getLesson = useCallback(async () => {
    const res = await fetchPostJson({
      path: "/lesson-share/lesson-data",
      data: {
        hash,
      },
    });
    const data = await res.json();

    if (data.lesson) {
      setLesson(data.lesson);
    }
  }, [hash]);

  useEffect(() => {
    getLesson();
  }, [getLesson]);

  const { exList, getExList } = useExList(lesson?.id);

  useEffect(() => {
    if (lesson?.id) {
      getExList(lesson.id, hash);
    }
  }, [lesson?.id, hash]);

  if (!lesson) {
    return null;
  }

  // const exList = useMemo(() => {
  //   const list = lesson.exList

  //   let mappedList = list
  //     ?.map((l, index) => {
  //       const dataMapper = getDataMapper(l.type);
  //       return {
  //         ...l,
  //         data: dataMapper(l.data),
  //         sortIndex: l.sortIndex,
  //       };
  //     })
  //     ?.sort((a, b) => {
  //       if (a.sortIndex < b.sortIndex) return -1;
  //       if (a.sortIndex > b.sortIndex) return 1;
  //       return 0;
  //     });
  // }, lesson.exList);

  console.log("exList?", exList);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="h-8 sm:h-10 md:h-14" />
        <p className="mx-auto max-w-[600px] px-2 text-center text-base font-medium leading-snug sm:text-xl sm:leading-[26px]">
          <T k="lessons.sharedLessonIntro" />{" "}
          <Link href="/lesson_plans" className="text-primary hover:underline">
            &quot;<T k="editor.myLessons" />&quot;
          </Link>{" "}
          <T k="lessons.sharedLessonIntroEnd" />
        </p>
        <div className="h-8 sm:h-10" />
        <div className="flex w-full min-w-0 items-start gap-4">
          <div className="w-full min-w-0">
            <div className="box-border w-full min-w-0 rounded-[10px] bg-white p-3 sm:p-5 md:p-8 lg:p-10">
              <h1 className="break-words px-1 text-center text-[26px] font-bold leading-tight text-primary sm:text-[32px] md:text-[38px] lg:text-[44px]">
                {lesson?.title}
              </h1>
              {!!lesson?.description && (
                <h2 className="mx-auto mt-3 max-w-[800px] whitespace-pre-line break-words px-2 text-center text-base font-medium sm:mt-4 sm:text-lg md:text-xl">
                  {lesson?.description}
                </h2>
              )}
              <div className="h-6 sm:h-8"></div>
              {!!lesson?.image_path && (
                <div className="mb-8 w-full min-w-0 max-w-full sm:mb-12 md:mb-14">
                  <Zoom>
                    <img
                      src={getImageUrl(lesson.image_path)}
                      className="mx-auto block h-auto max-h-[min(55vh,400px)] max-w-full object-contain"
                      alt="image lesson"
                    />
                  </Zoom>
                </div>
              )}
              <div className="h-4 sm:h-8"></div>
              <div key={exList.length}>
                <ExList
                  list={exList}
                  isView
                  key={exList.length}
                  is2easy={true}
                  isAdmin={false}
                />
              </div>
              {lesson?.user_id !== profile?.id && (
                <div className="flex justify-center px-1">
                  <Button
                    size="lg"
                    color="primary"
                    className="min-h-12 w-full touch-manipulation sm:w-auto"
                    onClick={async () => {
                      const res = await fetchPostJson({
                        path: "/lessons/copy",
                        isSecure: true,
                        data: {
                          lesson_id: lesson?.id,
                          hash,
                        },
                      });
                      const data = await res.json();
                      checkResponse(data);
                      window.location.pathname = `/editor/${data.id}`;
                    }}
                  >
                    <T k="lessons.addToMyLessons" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-16" />
      </ContentWrapper>
    </main>
  );
}
