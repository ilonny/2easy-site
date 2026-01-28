"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { ExList } from "@/app/editor/components/view/ExList";
import { getImageUrl } from "@/app/editor/helpers";
import { useExList } from "@/app/editor/hooks/useExList";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AuthContext } from "@/auth";
import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs, Button } from "@nextui-org/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function GrammarPage() {
  const { checkSubscription, hasSubscription } = useCheckSubscription();
  const { profile } = useContext(AuthContext);
  const router = useRouter();
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
      isSecure: true,
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
        <div className="h-10" />
        <div className="h-10" />
        {/* <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          SHARED LESSON
        </h1> */}
        <p
          className="max-w-[600px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
        >
          С вами поделились уроком, а это всегда приятно!
          <br />
          Ознакомьтесь с ним и добавьте в{" "}
          <Link href="/lesson_plans" className="hover:underline text-primary">
            "Мои уроки"
          </Link>{" "}
          для редактирования в личном кабинете.
        </p>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-start gap-4">
          <div className="w-[100%]">
            <div
              className="p-2 lg:p-10"
              style={{
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: 10,
                margin: "none",
              }}
            >
              <h1
                style={{
                  fontSize: 44,
                  textAlign: "center",
                  color: "#3f28c6",
                  fontWeight: 700,
                }}
              >
                {lesson?.title}
              </h1>
              {!!lesson?.description && (
                <h2
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    // color: "#3f28c6",
                    fontWeight: 500,
                    maxWidth: 800,
                    margin: "auto",
                    whiteSpace: "break-spaces",
                  }}
                >
                  {lesson?.description}
                </h2>
              )}
              <div className="h-8"></div>
              {!!lesson?.image_path && (
                <Zoom>
                  <img
                    src={getImageUrl(lesson.image_path)}
                    style={{ maxHeight: 400, margin: "auto", marginBottom: 60 }}
                    alt="image lesson"
                  />
                </Zoom>
              )}
              <div className="h-8"></div>
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
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    color="primary"
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
                    {'Добавить в "Мои уроки"'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentWrapper>
    </main>
  );
}
