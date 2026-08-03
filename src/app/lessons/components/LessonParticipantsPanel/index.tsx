"use client";

import { Button, Card } from "@nextui-org/react";
import { FC, ReactNode } from "react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { IconDictionaryButton } from "@/app/dictionary/components/DictionaryButtons";
import { LESSON_PARTICIPANT_DICTIONARY_ICON_WRAPPER_CLASS } from "@/app/dictionary/constants";
import InfoIcon from "@/assets/icons/info.svg";

export type TLessonParticipant = {
  id: number | string;
  student_id: number;
  "student.name"?: string;
  "student.email"?: string;
};

type TProps = {
  students: TLessonParticipant[];
  activeStudentId: number;
  isTeacher: boolean;
  compact?: boolean;
  onSelectStudent: (studentId: number) => void;
  onOpenDictionary?: (studentId: number) => void;
  onFocusScroll?: () => void;
  headerExtra?: ReactNode;
};

export const LessonParticipantsPanel: FC<TProps> = ({
  students,
  activeStudentId,
  isTeacher,
  compact = false,
  onSelectStudent,
  onOpenDictionary,
  onFocusScroll,
  headerExtra,
}) => {
  return (
    <div
      className={
        compact
          ? "flex max-h-[min(70dvh,520px)] flex-col"
          : "flex max-h-[calc(100dvh-88px-12rem)] flex-col lg:max-h-[calc(100dvh-2rem-12rem)]"
      }
    >
      <div className={`mb-1.5 shrink-0 sm:mb-3 md:mb-7 ${compact ? "mb-3 sm:mb-3" : ""}`}>
        {headerExtra}
        {!compact && (
          <p className="text-center text-[7px] font-bold uppercase leading-tight text-[#231F20] sm:text-[9px] md:text-left md:text-sm">
            <span className="md:hidden">
              <T k="lessons.participantsShort" defaultText="Участн." />
            </span>
            <span className="hidden md:inline">
              <T k="lessons.participants" defaultText="УЧАСТНИКИ" />
            </span>
          </p>
        )}
      </div>
      <div
        className={`flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] sm:gap-2 md:gap-3 ${
          compact ? "gap-2" : ""
        }`}
      >
        {students.map((s) => {
          const isActive = s?.student_id === activeStudentId;
          return (
            <div
              key={s.id}
              onClick={() => onSelectStudent(s.student_id)}
              className="min-w-0 cursor-pointer touch-manipulation"
            >
              <Card
                className={`w-full min-w-0 ${compact ? "p-3" : "p-1 sm:p-2 md:p-4"}`}
                shadow="none"
                style={{
                  backgroundColor: isActive ? "#EEEBFF" : "#fff",
                }}
              >
                <div
                  className={
                    compact
                      ? "flex flex-row items-center gap-2"
                      : "flex flex-col gap-1 sm:gap-1.5 md:flex-row md:items-center md:gap-2"
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        compact
                          ? "break-words text-sm font-bold uppercase leading-snug text-[#231F20]"
                          : "line-clamp-4 break-words text-[8px] font-bold uppercase leading-snug text-[#231F20] sm:text-[10px] md:line-clamp-none md:text-sm"
                      }
                    >
                      {s["student.name"]}
                    </p>
                    {!!s["student.email"] && (
                      <p
                        className={
                          compact
                            ? "mt-0.5 break-all text-xs text-[#767676]"
                            : "mt-0.5 hidden break-all text-[#767676] md:mt-1 md:block md:text-sm"
                        }
                      >
                        {s["student.email"]}
                      </p>
                    )}
                  </div>
                  {isTeacher && onOpenDictionary && (
                    <div className={LESSON_PARTICIPANT_DICTIONARY_ICON_WRAPPER_CLASS}>
                      <IconDictionaryButton
                        size="compact"
                        iconSize={20}
                        onClick={() => {
                          onOpenDictionary(Number(s.student_id));
                        }}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      {isTeacher && onFocusScroll && (
        <div
          className={
            compact
              ? "mt-3 flex shrink-0 flex-row items-center gap-2"
              : "mt-2 flex shrink-0 flex-col items-stretch gap-1.5 sm:mt-3 sm:flex-row sm:items-center sm:gap-2 md:mt-4"
          }
        >
          <Button
            variant="flat"
            color="default"
            className={
              compact
                ? "min-h-11 w-full flex-1 touch-manipulation px-3 py-2 text-xs"
                : "min-h-0 w-full flex-1 px-0.5 py-1.5 text-[8px] leading-tight sm:min-h-[36px] sm:px-2 sm:py-2 sm:text-[10px] md:min-h-[44px] md:px-3 md:text-xs"
            }
            size="sm"
            style={{
              justifyContent: "center",
              whiteSpace: "normal",
              height: "auto",
              minHeight: compact ? 44 : 0,
              lineHeight: "120%",
              textAlign: "center",
              backgroundColor: "#F3F4F6",
              color: "#111827",
              border: "1px solid rgba(17,24,39,0.12)",
            }}
            onClick={onFocusScroll}
          >
            <T k="lessons.focusScroll.button" />
          </Button>
          <ResponsiveTooltip
            content={
              <div
                style={{
                  maxWidth: 320,
                  whiteSpace: "normal",
                  lineHeight: "140%",
                }}
              >
                <T k="lessons.focusScroll.tooltip" />
              </div>
            }
            placement="left"
            closeDelay={0}
          >
            <div
              role="button"
              aria-label="help"
              tabIndex={0}
              className={
                compact
                  ? "mx-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full touch-manipulation"
                  : "mx-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-[34px] sm:w-[34px]"
              }
              style={{
                background: "rgba(63,40,198,0.06)",
                border: "1px solid rgba(63,40,198,0.14)",
                cursor: "pointer",
                userSelect: "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                }
              }}
            >
              <img
                src={InfoIcon.src}
                alt="info"
                style={{ width: 16, height: 16, opacity: 0.9 }}
              />
            </div>
          </ResponsiveTooltip>
        </div>
      )}
      <span className="sr-only">{i18n.t("lessons.participantsAriaLabel")}</span>
    </div>
  );
};
