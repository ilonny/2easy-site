"use client";

import { TAiLessonPreview } from "../api/lessonAssist";
import {
  TAiLessonDraft,
  getExerciseTypeLabel,
} from "@/app/lessons/components/CreateLessonWithAiModal/types";
import { buildDraftDiff, TAiExerciseDiff } from "../utils/draftDiff";

type TProps = {
  preview: TAiLessonPreview;
  baseline: TAiLessonDraft;
};

const ExerciseRow = ({
  item,
  tone,
}: {
  item: TAiExerciseDiff;
  tone: "added" | "modified" | "removed";
}) => {
  const marker =
    tone === "added" ? "+" : tone === "removed" ? "−" : "Изменено";
  const markerClass =
    tone === "added"
      ? "bg-success-100 text-success-700"
      : tone === "removed"
        ? "bg-danger-100 text-danger-700"
        : "bg-warning-100 text-warning-700";
  return (
    <div className="rounded-lg border border-default-200 bg-content1 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="text-xs text-default-400">
            {getExerciseTypeLabel(item.type)} · место {item.index + 1}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${markerClass}`}
        >
          {marker}
        </span>
      </div>
      {!!item.changedFields.length && (
        <p className="mt-1.5 text-xs text-default-600">
          Меняется: {item.changedFields.join(", ")}
        </p>
      )}
      {!!item.details.length && (
        <div className="mt-2 space-y-1.5 border-t border-default-100 pt-2">
          {item.details.map((detail) => (
            <div key={detail.label}>
              <p className="text-[11px] font-medium text-default-500">
                {detail.label}
              </p>
              <p className="break-words text-xs text-default-400 line-through">
                {detail.before}
              </p>
              <p className="break-words text-xs text-foreground">
                {detail.after}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AiDraftPreviewSummary = ({ preview, baseline }: TProps) => {
  const calculatedDiff = buildDraftDiff(baseline, preview);
  const diff = {
    ...calculatedDiff,
    added:
      preview.summary?.exercisesAdded === 0 ? [] : calculatedDiff.added,
    modified:
      preview.summary?.exercisesModified === 0
        ? []
        : calculatedDiff.modified,
    removed:
      preview.summary?.exercisesRemoved === 0 ? [] : calculatedDiff.removed,
  };
  const total =
    diff.meta.length +
    diff.added.length +
    diff.modified.length +
    diff.removed.length;

  return (
    <div className="rounded-xl border border-secondary-200 bg-secondary-50/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Проверьте изменения</p>
          <p className="text-xs text-default-500">
            {total
              ? `Найдено изменений: ${total}`
              : "AI не предложил фактических изменений"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-default-100 px-2 py-1 text-[11px] text-default-500">
          Не сохранено
        </span>
      </div>

      <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
        {!!diff.meta.length && (
          <section>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-default-500">
              Об уроке
            </p>
            <div className="space-y-1.5">
              {diff.meta.map((item) => (
                <div
                  key={item.field}
                  className="rounded-lg border border-default-200 bg-content1 px-3 py-2"
                >
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="mt-1 break-words text-xs text-default-500 line-through">
                    {item.before || "Не указано"}
                  </p>
                  <p className="mt-0.5 break-words text-sm text-foreground">
                    {item.after || "Будет очищено"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        {!!diff.modified.length && (
          <section>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-default-500">
              Изменённые задания
            </p>
            <div className="space-y-1.5">
              {diff.modified.map((item) => (
                <ExerciseRow key={item.key} item={item} tone="modified" />
              ))}
            </div>
          </section>
        )}
        {!!diff.added.length && (
          <section>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-default-500">
              Новые задания
            </p>
            <div className="space-y-1.5">
              {diff.added.map((item) => (
                <ExerciseRow key={item.key} item={item} tone="added" />
              ))}
            </div>
          </section>
        )}
        {!!diff.removed.length && (
          <section>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-default-500">
              Будут удалены
            </p>
            <div className="space-y-1.5">
              {diff.removed.map((item) => (
                <ExerciseRow key={item.key} item={item} tone="removed" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
