"use client";

import { FC, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Image,
  Modal,
  ModalBody,
  ModalContent,
} from "@nextui-org/react";
import { fetchPostJson } from "@/api";
import { getImageUrl } from "@/app/editor/helpers";
import CreateLessonBgCard from "@/assets/images/create_lesson_bg_card.png";
import { toast } from "react-toastify";

type TCourseOption = { id: number; title: string; image_path?: string };

type TResultState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "done";
      results: {
        my_lessons?: { success: boolean; id?: number; message?: string };
        courses: Array<{
          course_id: number;
          success: boolean;
          id?: number;
          message?: string;
        }>;
      };
    }
  | { status: "error"; message: string };

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  courseOptions: TCourseOption[];
  onAfterCopy?: () => void;
};

export const CopyLessonToModal: FC<TProps> = ({
  isOpen,
  onClose,
  lessonId,
  courseOptions,
  onAfterCopy,
}) => {
  const [toMyLessons, setToMyLessons] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [result, setResult] = useState<TResultState>({ status: "idle" });

  useEffect(() => {
    if (!isOpen) {
      setToMyLessons(true);
      setSelectedCourseIds([]);
      setResult({ status: "idle" });
    }
  }, [isOpen]);

  const canSubmit = useMemo(() => {
    return Boolean(toMyLessons || selectedCourseIds.length);
  }, [toMyLessons, selectedCourseIds.length]);

  const submit = async () => {
    if (!canSubmit) return;
    setResult({ status: "loading" });
    try {
      const res = await fetchPostJson({
        path: "/lessons/copy-to",
        isSecure: true,
        data: {
          lesson_id: lessonId,
          to_my_lessons: toMyLessons,
          course_ids: selectedCourseIds,
        },
      });
      const data = await res.json();
      if (!data?.success) {
        setResult({
          status: "error",
          message: data?.message || "Не удалось скопировать урок",
        });
        return;
      }

      const results = data.results as {
        my_lessons?: { success: boolean };
        courses: Array<{ success: boolean }>;
      };
      const allOk =
        (!results?.my_lessons || results.my_lessons.success) &&
        (results?.courses || []).every((r) => r.success);

      if (allOk) {
        toast.success("Копирование завершено успешно");
        onAfterCopy?.();
        onClose();
        return;
      }

      setResult({ status: "done", results: data.results });
      onAfterCopy?.();
    } catch (e: any) {
      setResult({
        status: "error",
        message: e?.message || "Не удалось скопировать урок",
      });
    }
  };

  const toggleCourse = (courseId: number) => {
    setSelectedCourseIds((prev) => {
      if (prev.includes(courseId)) return prev.filter((id) => id !== courseId);
      return prev.concat(courseId);
    });
  };

  const courseTitleById = useMemo(() => {
    return new Map(courseOptions.map((c) => [c.id, c.title]));
  }, [courseOptions]);

  const renderPlaque = (params: {
    key: string | number;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    selected: boolean;
    onToggle: () => void;
  }) => {
    return (
      <div
        key={params.key}
        role="button"
        tabIndex={0}
        onClick={params.onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            params.onToggle();
          }
        }}
        className={[
          "w-full",
          "p-3",
          "rounded-xl",
          "border",
          "bg-white",
          "flex",
          "items-center",
          "justify-between",
          "gap-3",
          "cursor-pointer",
          params.selected ? "border-[#3F28C6]" : "border-default-200",
        ].join(" ")}
        style={{
          boxShadow: params.selected
            ? "0 0 0 3px rgba(63, 40, 198, 0.08)"
            : "none",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-[44px] h-[44px] rounded-full overflow-hidden bg-default-100 flex-shrink-0"
            style={{ border: "1px solid rgba(0,0,0,0.06)" }}
          >
            {!!params.imageUrl ? (
              <Image
                src={params.imageUrl}
                alt=""
                width={44}
                height={44}
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-default-900 font-medium truncate">
              {params.title}
            </p>
            {!!params.subtitle && (
              <p className="text-default-500 truncate" style={{ fontSize: 12 }}>
                {params.subtitle}
              </p>
            )}
          </div>
        </div>

        <Checkbox
          isSelected={params.selected}
          onValueChange={() => params.onToggle()}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      style={{ background: "#fff" }}
      className="p-6"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalBody>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Куда скопировать урок?</p>
            <p className="text-default-500" style={{ fontSize: 13 }}>
              Можно выбрать несколько вариантов.
            </p>
          </div>

          <Divider className="my-2" />

          <div className="flex flex-col gap-3">
            {renderPlaque({
              key: "my-lessons",
              title: "Мои уроки",
              subtitle: 'Урок будет отображаться в разделе "Мои уроки"',
              imageUrl: CreateLessonBgCard.src,
              selected: toMyLessons,
              onToggle: () => setToMyLessons((p) => !p),
            })}

            {!!courseOptions?.length && (
              <div>
                <p className="text-default-500 mb-2" style={{ fontSize: 13 }}>
                  Другие мои курсы
                </p>
                <div className="flex flex-col gap-2 max-h-[260px] overflow-auto pr-2">
                  {courseOptions.map((c) =>
                    renderPlaque({
                      key: c.id,
                      title: c.title,
                      imageUrl: c.image_path ? getImageUrl(c.image_path) : "",
                      selected: selectedCourseIds.includes(c.id),
                      onToggle: () => toggleCourse(c.id),
                    }),
                  )}
                </div>
              </div>
            )}
          </div>

          {result.status === "error" && (
            <p className="text-danger" style={{ fontSize: 13 }}>
              {result.message}
            </p>
          )}

          {result.status === "done" && (
            <div className="text-default-700" style={{ fontSize: 13 }}>
              {result.results?.my_lessons && (
                <p>
                  Мои уроки:{" "}
                  {result.results.my_lessons.success
                    ? "успешно"
                    : `ошибка${result.results.my_lessons.message ? ` — ${result.results.my_lessons.message}` : ""}`}
                </p>
              )}
              {!!result.results?.courses?.length && (
                <div className="mt-2 flex flex-col gap-1">
                  {result.results.courses.map((r) => (
                    <p key={String(r.course_id) + String(r.id || "")}>
                      {courseTitleById.get(r.course_id) || `Курс #${r.course_id}`}:{" "}
                      {r.success
                        ? "успешно"
                        : `ошибка${r.message ? ` — ${r.message}` : ""}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end mt-2">
            <Button
              variant="light"
              onClick={onClose}
              isDisabled={result.status === "loading"}
            >
              Закрыть
            </Button>
            <Button
              color="primary"
              onClick={submit}
              isLoading={result.status === "loading"}
              isDisabled={!canSubmit || result.status === "done"}
            >
              Копировать
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

