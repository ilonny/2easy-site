"use client";

import { Button, Link } from "@nextui-org/react";
import { FC, ReactNode } from "react";
import { T } from "@/i18n/T";

type TProps = {
  /** homework-check | homework-edit | lesson-edit */
  mode: "homework-check" | "homework-edit" | "lesson-edit";
  studentName?: string;
  studentEmail?: string;
  /** personal student copy vs shared template */
  isPersonalHomework?: boolean;
  editHref?: string;
  sticky?: boolean;
  actions?: ReactNode;
};

export const LessonModeBanner: FC<TProps> = ({
  mode,
  studentName,
  studentEmail,
  isPersonalHomework,
  editHref,
  sticky = false,
  actions,
}) => {
  const isHomework = mode === "homework-check" || mode === "homework-edit";
  const titleKey =
    mode === "lesson-edit"
      ? "editor.modeEditingLesson"
      : mode === "homework-edit"
        ? studentName
          ? "editor.modeEditingHomeworkFor"
          : isPersonalHomework
            ? "editor.modeEditingHomework"
            : "editor.modeEditingHomeworkShared"
        : studentName
          ? "lessons.modeHomeworkCheckFor"
          : "lessons.modeHomeworkCheck";

  const hintKey =
    mode === "homework-edit"
      ? studentName || isPersonalHomework
        ? "editor.homeworkPersonalHint"
        : "editor.homeworkSharedHint"
      : mode === "homework-check"
        ? "lessons.homeworkCheckHint"
        : undefined;

  return (
    <div
      className={[
        sticky
          ? `sticky z-20 top-3 lg:top-4`
          : "",
        "rounded-2xl border border-brand-violet/15 bg-[#F6F4FF]/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4 sm:py-3.5",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-violet/80">
            {isHomework ? (
              <T k="lessons.modeBadgeHomework" />
            ) : (
              <T k="lessons.modeBadgeLesson" />
            )}
          </p>
          <p className="mt-0.5 text-base font-bold tracking-brand text-brand-black">
            <T
              k={titleKey}
              values={studentName ? { name: studentName } : undefined}
            />
          </p>
          {!!studentEmail && (
            <p className="truncate text-small text-default-500">{studentEmail}</p>
          )}
          {!!hintKey && (
            <p className="mt-1 text-small leading-snug text-default-600">
              <T k={hintKey} />
            </p>
          )}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {actions}
          {!!editHref && (
            <Link href={editHref} className="w-full sm:w-auto">
              <Button
                color="primary"
                className="min-h-10 w-full touch-manipulation px-4 font-bold tracking-brand sm:w-auto"
              >
                <T k="lessons.editHomework" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
