"use client";

import {
  fetchGet,
  fetchPostJson,
  fetchPostMultipartWithProgress,
} from "@/api";
import { TCourse } from "@/app/course/hooks/useCourses";
import {
  catalogFetchParams,
  useCatalogWorkspace,
} from "@/app/school/lib/catalogWorkspace";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";
import { T } from "@/i18n/T";
import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Progress,
} from "@nextui-org/react";
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CWS_URL =
  "https://chromewebstore.google.com/detail/2easy-progressme-export/mffboabccpkfbnlephbhigcamgjleaaa?hl=ru";

/** Max ZIP size (must match backend multer + nginx client_max_body_size). */
const PM_IMPORT_MAX_ZIP_BYTES = 500 * 1024 * 1024;
const PM_IMPORT_MAX_ZIP_LABEL = "500 МБ";
const PAYLOAD_TOO_LARGE_MESSAGE =
  `Архив слишком большой или сервер отклонил загрузку (лимит ${PM_IMPORT_MAX_ZIP_LABEL}). Разбейте учебник на части или уменьшите медиа.`;

export type TPmImportMode = "standalone" | "into_course" | "new_course";

type TPreviewExercise = {
  key: string;
  title: string;
  type: string;
  recognized?: boolean;
  warning?: string;
};

type TPreviewLesson = {
  key: string;
  title: string;
  moduleTitle?: string;
  exerciseCount: number;
  exercises: TPreviewExercise[];
};

type TPreview = {
  title: string;
  description: string;
  lessons: TPreviewLesson[];
};

type TJob = {
  id: string;
  phase:
    | "uploading"
    | "parsing"
    | "ready"
    | "creating"
    | "done"
    | "error";
  percent: number;
  message: string;
  error?: string;
  preview?: TPreview;
  create?: {
    mode: TPmImportMode;
    courseId?: number | null;
    courseTitle?: string;
    done: number;
    total: number;
    lessons: {
      key: string;
      title: string;
      status: string;
      lessonId?: number | null;
      error?: string;
    }[];
    createdLessonIds: number[];
  };
};

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  mode: TPmImportMode;
  currentCourse?: TCourse;
  onSuccess: () => void;
  /** Open help sheet when the modal becomes visible */
  initialHelpOpen?: boolean;
};

type TStep = "pick" | "upload" | "preview" | "creating" | "done" | "error";

export const ImportPmArchiveModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  mode,
  currentCourse,
  onSuccess,
  initialHelpOpen = false,
}) => {
  const workspace = useCatalogWorkspace();
  const catalog = catalogFetchParams(workspace);
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<TStep>("pick");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<TJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [lessonChecked, setLessonChecked] = useState<Record<string, boolean>>(
    {},
  );
  const [exerciseChecked, setExerciseChecked] = useState<
    Record<string, boolean>
  >({});
  const [helpOpen, setHelpOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewInitedRef = useRef(false);

  const reset = useCallback(() => {
    setStep("pick");
    setUploadPercent(0);
    setJobId(null);
    setJob(null);
    setError(null);
    setCourseTitle("");
    setLessonChecked({});
    setExerciseChecked({});
    setHelpOpen(false);
    previewInitedRef.current = false;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      reset();
      return;
    }
    if (initialHelpOpen) {
      setHelpOpen(true);
    }
  }, [isVisible, reset, initialHelpOpen]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const modeHint = useMemo(() => {
    if (mode === "new_course") {
      return "Будет создан новый курс, а выбранные уроки попадут внутрь него.";
    }
    if (mode === "into_course") {
      return `Уроки будут добавлены в курс «${currentCourse?.title || "текущий"}».`;
    }
    return "Уроки будут созданы как отдельные (без курса).";
  }, [mode, currentCourse?.title]);

  const initChecksFromPreview = useCallback((preview: TPreview) => {
    const lessons: Record<string, boolean> = {};
    const exercises: Record<string, boolean> = {};
    for (const l of preview.lessons || []) {
      lessons[l.key] = true;
      for (const e of l.exercises || []) {
        exercises[e.key] = true;
      }
    }
    setLessonChecked(lessons);
    setExerciseChecked(exercises);
    setCourseTitle(preview.title || "");
  }, []);

  const pollJob = useCallback(
    async (id: string) => {
      try {
        const res = await fetchGet({
          path: `/pm-import/jobs/${id}`,
          isSecure: true,
          ...catalog,
        });
        const data = await res.json();
        if (!data?.success || !data.job) {
          setError(data?.message || "Не удалось получить статус");
          setStep("error");
          return;
        }
        const next: TJob = data.job;
        setJob(next);

        if (next.phase === "parsing" || next.phase === "uploading") {
          setStep("upload");
        } else if (next.phase === "ready" && next.preview) {
          if (!previewInitedRef.current) {
            previewInitedRef.current = true;
            initChecksFromPreview(next.preview);
          }
          setStep("preview");
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } else if (next.phase === "creating") {
          setStep("creating");
        } else if (next.phase === "done") {
          setStep("done");
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } else if (next.phase === "error") {
          setError(next.error || next.message || "Ошибка");
          setStep("error");
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (e: any) {
        setError(e?.message || "Ошибка опроса статуса");
        setStep("error");
      }
    },
    [catalog, initChecksFromPreview],
  );

  const startPolling = useCallback(
    (id: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      void pollJob(id);
      pollRef.current = setInterval(() => void pollJob(id), 1200);
    },
    [pollJob],
  );

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".zip")) {
        setError("Нужен ZIP-архив из расширения 2easy ProgressMe Export");
        setStep("error");
        return;
      }
      if (file.size > PM_IMPORT_MAX_ZIP_BYTES) {
        setError(
          `Файл больше ${PM_IMPORT_MAX_ZIP_LABEL}. Экспортируйте учебник частями или уменьшите медиа.`,
        );
        setStep("error");
        return;
      }
      setError(null);
      setStep("upload");
      setUploadPercent(0);
      try {
        const form = new FormData();
        form.append("archive", file);
        const json = await fetchPostMultipartWithProgress({
          path: "/pm-import/upload",
          data: form,
          isSecure: true,
          ...catalog,
          onProgress: ({ loaded, total }) => {
            setUploadPercent(
              total > 0 ? Math.min(99, Math.round((loaded / total) * 100)) : 0,
            );
          },
        });
        if (!json?.success || !json.jobId) {
          const tooLarge =
            json?.status === 413 ||
            /payload too large|request entity too large|слишком большой/i.test(
              String(json?.message || ""),
            );
          setError(
            tooLarge
              ? PAYLOAD_TOO_LARGE_MESSAGE
              : json?.message || "Не удалось загрузить архив",
          );
          setStep("error");
          return;
        }
        setUploadPercent(100);
        setJobId(json.jobId);
        setJob(json.job || null);
        startPolling(json.jobId);
      } catch (e: any) {
        setError(e?.message || "Ошибка загрузки");
        setStep("error");
      }
    },
    [catalog, startPolling],
  );

  const toggleLesson = (lessonKey: string, value: boolean, exercises: TPreviewExercise[]) => {
    setLessonChecked((prev) => ({ ...prev, [lessonKey]: value }));
    setExerciseChecked((prev) => {
      const next = { ...prev };
      for (const e of exercises) next[e.key] = value;
      return next;
    });
  };

  const toggleExercise = (
    lessonKey: string,
    exerciseKey: string,
    value: boolean,
    allExercises: TPreviewExercise[],
  ) => {
    setExerciseChecked((prev) => {
      const next = { ...prev, [exerciseKey]: value };
      const anyOn = allExercises.some((e) =>
        e.key === exerciseKey ? value : next[e.key] !== false,
      );
      setLessonChecked((lp) => ({ ...lp, [lessonKey]: anyOn }));
      return next;
    });
  };

  const onConfirm = useCallback(async () => {
    if (!jobId || !job?.preview) return;
    if (mode === "new_course" && !courseTitle.trim()) {
      setError("Укажите название курса");
      return;
    }
    setError(null);
    setStep("creating");
    try {
      const selection = {
        lessons: (job.preview.lessons || []).map((l) => ({
          key: l.key,
          included: lessonChecked[l.key] !== false,
          exercises: (l.exercises || []).map((e) => ({
            key: e.key,
            included: exerciseChecked[e.key] !== false,
          })),
        })),
      };
      const res = await fetchPostJson({
        path: `/pm-import/jobs/${jobId}/confirm`,
        isSecure: true,
        ...catalog,
        data: {
          mode,
          course_id: mode === "into_course" ? currentCourse?.id : undefined,
          course_title: mode === "new_course" ? courseTitle.trim() : undefined,
          selection,
        },
      });
      const data = await res.json();
      if (!data?.success) {
        setError(data?.message || "Не удалось запустить импорт");
        setStep("error");
        return;
      }
      if (data.job) setJob(data.job);
      startPolling(jobId);
    } catch (e: any) {
      setError(e?.message || "Ошибка подтверждения");
      setStep("error");
    }
  }, [
    jobId,
    job,
    mode,
    courseTitle,
    lessonChecked,
    exerciseChecked,
    catalog,
    currentCourse?.id,
    startPolling,
  ]);

  const selectedCount = useMemo(() => {
    return Object.values(lessonChecked).filter(Boolean).length;
  }, [lessonChecked]);

  return (
    <>
      <Modal
        isOpen={isVisible}
        onClose={() => setIsVisible(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{ wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>
                <T
                  k="pmImport.title"
                  defaultText="Импорт архива ProgressMe"
                />
              </span>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-default-300 text-sm text-default-600 hover:bg-default-100"
                aria-label="Инструкция"
                onClick={() => setHelpOpen(true)}
              >
                ?
              </button>
            </div>
            <p className="text-sm font-normal text-default-500">{modeHint}</p>
          </ModalHeader>
          <ModalBody className="pb-8">
            {(step === "pick" || step === "error") && (
              <div className="flex flex-col gap-4">
                {error && (
                  <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">
                    {error}
                  </p>
                )}
                <div
                  className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-default-300 px-4 py-8 text-center hover:border-primary"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) void onFile(f);
                  }}
                >
                  <p className="font-medium">
                    Перетащите ZIP сюда или нажмите, чтобы выбрать
                  </p>
                  <p className="text-sm text-default-500">
                    Архив из расширения 2easy ProgressMe Export · до{" "}
                    {PM_IMPORT_MAX_ZIP_LABEL}
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    e.target.value = "";
                    void onFile(f);
                  }}
                />
                <Button
                  variant="bordered"
                  as="a"
                  href={CWS_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Скачать расширение в Chrome Web Store
                </Button>
              </div>
            )}

            {step === "upload" && (
              <div className="flex flex-col gap-3 py-4">
                <p className="text-sm">
                  {job?.message || "Загрузка архива на сервер…"}
                </p>
                <Progress
                  aria-label="upload"
                  value={
                    job?.phase === "parsing" || job?.phase === "ready"
                      ? job.percent
                      : uploadPercent
                  }
                  color="primary"
                />
              </div>
            )}

            {step === "preview" && job?.preview && (
              <div className="flex flex-col gap-4">
                {mode === "new_course" && (
                  <Input
                    label="Название курса"
                    value={courseTitle}
                    onValueChange={setCourseTitle}
                    isRequired
                    size="lg"
                  />
                )}
                <p className="text-sm text-default-600">
                  Найдено уроков: {job.preview.lessons.length}. Выбрано:{" "}
                  {selectedCount}. Снимите галочки с того, что не нужно
                  импортировать.
                </p>
                {job.preview.lessons.some((l) =>
                  l.exercises.some((e) => e.recognized === false || e.warning),
                ) ? (
                  <p className="rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning-700">
                    Есть задания, которые не удалось полностью распознать — они
                    отмечены ниже. Их можно снять с импорта или оставить как
                    текст.
                  </p>
                ) : null}
                <Accordion selectionMode="multiple" variant="bordered">
                  {job.preview.lessons.map((lesson) => {
                    const badCount = lesson.exercises.filter(
                      (e) => e.recognized === false || !!e.warning,
                    ).length;
                    return (
                    <AccordionItem
                      key={lesson.key}
                      aria-label={lesson.title}
                      title={
                        <div className="flex items-center gap-3 pr-2">
                          <Checkbox
                            isSelected={lessonChecked[lesson.key] !== false}
                            onValueChange={(v) =>
                              toggleLesson(lesson.key, v, lesson.exercises)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-xs text-default-500">
                              {lesson.moduleTitle
                                ? `${lesson.moduleTitle} · `
                                : ""}
                              {lesson.exerciseCount} заданий
                              {badCount > 0
                                ? ` · не распознано: ${badCount}`
                                : ""}
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="flex flex-col gap-2 pb-2 pl-2">
                        {lesson.exercises.map((ex) => {
                          const unrecognized =
                            ex.recognized === false || !!ex.warning;
                          return (
                          <label
                            key={ex.key}
                            className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-sm ${
                              unrecognized ? "bg-warning-50" : ""
                            }`}
                          >
                            <Checkbox
                              isSelected={exerciseChecked[ex.key] !== false}
                              onValueChange={(v) =>
                                toggleExercise(
                                  lesson.key,
                                  ex.key,
                                  v,
                                  lesson.exercises,
                                )
                              }
                              size="sm"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="font-medium">{ex.title}</span>
                              <span className="text-default-400">
                                {" "}
                                · {ex.type}
                              </span>
                              {unrecognized ? (
                                <span className="ml-2 inline-block rounded bg-warning-200 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-warning-800">
                                  Не распознано
                                </span>
                              ) : null}
                              {ex.warning ? (
                                <span className="mt-0.5 block text-xs text-warning-700">
                                  {ex.warning}
                                </span>
                              ) : null}
                            </span>
                          </label>
                          );
                        })}
                      </div>
                    </AccordionItem>
                    );
                  })}
                </Accordion>
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  isDisabled={selectedCount === 0}
                  onPress={() => void onConfirm()}
                >
                  Импортировать выбранное
                </Button>
              </div>
            )}

            {step === "creating" && (
              <div className="flex flex-col gap-3 py-2">
                <p className="text-sm">{job?.message || "Создание…"}</p>
                <Progress
                  aria-label="create"
                  value={job?.percent || 50}
                  color="primary"
                />
                {job?.create?.total ? (
                  <p className="text-sm text-default-500">
                    Урок {job.create.done} из {job.create.total}
                  </p>
                ) : null}
                <ul className="max-h-60 space-y-1 overflow-auto text-sm">
                  {(job?.create?.lessons || []).map((l) => (
                    <li key={l.key} className="flex justify-between gap-2">
                      <span>{l.title}</span>
                      <span className="text-default-400">{l.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step === "done" && (
              <div className="flex flex-col gap-4 py-2">
                <p className="text-base font-medium">
                  {job?.message || "Готово"}
                </p>
                {job?.create?.courseId ? (
                  <p className="text-sm text-default-600">
                    Курс id: {job.create.courseId}
                    {job.create.courseTitle
                      ? ` «${job.create.courseTitle}»`
                      : ""}
                  </p>
                ) : null}
                <p className="text-sm text-default-600">
                  Создано уроков:{" "}
                  {job?.create?.createdLessonIds?.length || 0}
                </p>
                <Button
                  color="primary"
                  size="lg"
                  onPress={() => {
                    setIsVisible(false);
                    onSuccess();
                  }}
                >
                  Готово
                </Button>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS,
          header: "shrink-0",
          body: "gap-3 overflow-y-auto overscroll-contain pb-8 text-sm max-sm:min-h-0",
        }}
      >
        <ModalContent>
          <ModalHeader>Как импортировать из ProgressMe</ModalHeader>
          <ModalBody>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Установите расширение{" "}
                <a
                  href={CWS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  2easy ProgressMe Export
                </a>{" "}
                в Chrome.
              </li>
              <li>
                Откройте учебник на ProgressMe или EdVibe, запустите расширение
                и экспортируйте выбранные уроки в ZIP (максимум{" "}
                {PM_IMPORT_MAX_ZIP_LABEL} на один архив).
              </li>
              <li>
                В 2easy нажмите «Импортировать архив» и загрузите полученный
                ZIP.
              </li>
              <li>
                Проверьте превью, снимите галочки с ненужных уроков/заданий и
                подтвердите импорт.
              </li>
            </ol>
            <div className="rounded-lg bg-default-100 p-3">
              <p className="mb-2 font-medium">Целый учебник — как курс</p>
              <p>
                Если переносите целый учебник (много уроков), оформляйте импорт
                как курс 2easy: откройте «Создать курс» → «Импортировать архив»,
                укажите название курса и загрузите ZIP. Не используйте обычное
                «Создать урок» — иначе уроки окажутся разрозненными без курса.
              </p>
            </div>
            <div className="rounded-lg bg-default-100 p-3">
              <p className="mb-2 font-medium">Куда попадут уроки</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <b>Создать урок</b> на главной lesson plans — отдельные уроки
                  без курса (удобно для 1–2 уроков, не для учебника).
                </li>
                <li>
                  <b>Создать урок</b> внутри открытого курса — уроки добавляются
                  в этот курс.
                </li>
                <li>
                  <b>Создать курс</b> → «Импортировать архив» — сначала укажите
                  название курса, затем в него попадут выбранные уроки
                  (рекомендуется для целого учебника).
                </li>
              </ul>
              <p className="mt-2 text-default-600">
                Размер ZIP — до {PM_IMPORT_MAX_ZIP_LABEL}. Если архив больше,
                экспортируйте учебник частями.
              </p>
            </div>
            <div className="w-full shrink-0 pt-1">
              <Button
                as="a"
                href={CWS_URL}
                target="_blank"
                rel="noreferrer"
                color="primary"
                className="h-auto min-h-10 w-full touch-manipulation whitespace-normal px-4 py-2.5 leading-snug"
              >
                Открыть страницу расширения
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

/** Admin (1) and teacher (2) — same as backend `isTeacherRole`. */
export function canUsePmImport(
  profile: { role_id?: number | string } | null | undefined,
) {
  const roleId = Number(profile?.role_id);
  return roleId === 1 || roleId === 2;
}
