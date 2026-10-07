"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchGet } from "@/api";
import { getImageUrl } from "@/app/editor/helpers";
import {
  isLessonLockedOnFreeTariff,
  TUserAccess,
  useCheckSubscription,
} from "@/app/subscription/helpers";
import { data as discussionCards } from "@/app/cards/data";
import { TTagTone } from "@/components/Tag";
import { TGameCard } from "./GameCard";

export type TContentTab =
  "lessons" | "courses" | "speaking" | "discussion" | "grammar";

type TApiLesson = {
  id: number | string;
  title?: string | null;
  description?: string | null;
  tags?: string | null;
  image_path?: string | null;
  is_free?: string | number | boolean | null;
  user_id?: number | string;
  created_from_2easy?: number | boolean | null;
};

type TApiCourse = TApiLesson & {
  lesson_ids?: string | null;
  is_deleted?: number | boolean | null;
};

// With the "try free" card the grid holds one card less.
const CARDS_LIMIT = 8;
const CARDS_LIMIT_WITH_TRY = 7;

// The grammar section's own endpoint is teachers-only; the same lessons are public as this course.
const GRAMMAR_COURSE_ID = 92;

const discussionMeta: Record<string, { count: string; level: string }> = {
  "games.discussionCards": { count: "140+", level: "A2+" },
  "games.controversial": { count: "30", level: "A2+" },
  "games.firstMeeting": { count: "30", level: "A2+" },
};

// Levels are typed by hand: "B1 – B2", "В1-В2" (Cyrillic), "A2 -- B1", "B1 +".
const normalizeLevel = (tag: string) =>
  tag
    .replace(
      /[АВС]/g,
      (letter) => ({ А: "A", В: "B", С: "C" })[letter] ?? letter,
    )
    .replace(/\s+/g, "")
    .replace(/[–—]+|-{2,}/g, "-")
    .toUpperCase();

const LEVEL_PATTERN = /^[ABC][12]\+?(-[ABC]?[12]\+?)?$/;

const parseTags = (tags?: string | null) => {
  const list = (tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const level = list.map(normalizeLevel).find((tag) => LEVEL_PATTERN.test(tag));
  const topic = list.find(
    (tag) => tag !== "18+" && !LEVEL_PATTERN.test(normalizeLevel(tag)),
  );
  return { level, topic };
};

const levelTone = (level: string): TTagTone =>
  level.startsWith("A") ? "green" : level.startsWith("B") ? "mint" : "blue";

const getJson = async <T>(
  path: string,
  isSecure: boolean,
  signal: AbortSignal,
) => {
  const res = await fetchGet({ path, isSecure, signal });
  const json = await res.json();
  if (json?.success === false) {
    throw new Error(json?.message || "Request failed");
  }
  return json as T;
};

export const useTabCards = (
  tab: TContentTab,
  access: TUserAccess,
): { cards: TGameCard[]; isLoading: boolean; isError: boolean } => {
  const { subscription } = useCheckSubscription();
  const isFreeTariff = subscription?.subscribe_type_id === 1;
  const isTeacher = access === "subscribed" || access === "noSubscription";
  const limit =
    access === "guest" || access === "noSubscription"
      ? CARDS_LIMIT_WITH_TRY
      : CARDS_LIMIT;

  const lessonsQuery = useQuery({
    queryKey: ["landing", "main-page-lessons"],
    queryFn: ({ signal }) =>
      getJson<{ lessons?: TApiLesson[] }>(
        "/main-page-lessons?disable_limit=1",
        false,
        signal,
      ),
    enabled: tab === "lessons",
    staleTime: 5 * 60 * 1000,
  });

  const coursesQuery = useQuery({
    queryKey: ["landing", "courses", isTeacher],
    // The endpoint only needs an Authorization header, so guests get 2easy courses too.
    queryFn: ({ signal }) =>
      getJson<{ courses?: TApiCourse[] }>("/course/list", true, signal),
    enabled: tab === "courses" && access !== "loading",
    staleTime: 5 * 60 * 1000,
  });

  const grammarQuery = useQuery({
    queryKey: ["landing", "grammar", isTeacher],
    queryFn: ({ signal }) =>
      getJson<{ lessons?: TApiLesson[] }>(
        isTeacher
          ? "/lessons/grammar"
          : `/lessons/course?course_id=${GRAMMAR_COURSE_ID}`,
        true,
        signal,
      ),
    enabled: tab === "grammar" && access !== "loading",
    staleTime: 5 * 60 * 1000,
  });

  const lessonHref = (lesson: TApiLesson) => {
    if (access === "guest") return "/registration";
    if (access === "noSubscription") return "/subscription";
    if (access !== "subscribed") return "/lesson_plans";
    const locked = isLessonLockedOnFreeTariff(
      { ...lesson, user_id: Number(lesson.user_id) },
      isFreeTariff,
    );
    return locked ? "/subscription" : `/editor/${lesson.id}`;
  };

  const toLessonCard = (lesson: TApiLesson): TGameCard => {
    const { level, topic } = parseTags(lesson.tags);
    return {
      title: lesson.title?.trim() ?? "",
      description: lesson.description?.trim() || undefined,
      href: lessonHref(lesson),
      image: lesson.image_path ? getImageUrl(lesson.image_path) : undefined,
      level,
      levelTone: level ? levelTone(level) : undefined,
      topic,
    };
  };

  switch (tab) {
    case "lessons":
      return {
        cards: (lessonsQuery.data?.lessons ?? [])
          .slice(0, limit)
          .map(toLessonCard),
        isLoading: lessonsQuery.isPending,
        isError: lessonsQuery.isError,
      };

    case "courses":
      return {
        cards: (coursesQuery.data?.courses ?? [])
          .filter(
            (course) => Number(course.user_id) === 1 && !course.is_deleted,
          )
          .slice(0, limit)
          .map((course) => {
            const level =
              parseTags(course.title).level ?? parseTags(course.tags).level;
            let lessonsCount = 0;
            try {
              lessonsCount = JSON.parse(course.lesson_ids || "[]").length;
            } catch {}
            return {
              title: course.title?.trim() ?? "",
              description: course.description?.trim() || undefined,
              href:
                access === "guest" ? "/registration" : `/course/${course.id}`,
              image: course.image_path
                ? getImageUrl(course.image_path)
                : undefined,
              count: lessonsCount,
              countKey: lessonsCount ? "content.lessonsCount" : undefined,
              level,
              levelTone: level ? levelTone(level) : undefined,
            };
          }),
        isLoading: coursesQuery.isPending,
        isError: coursesQuery.isError,
      };

    case "discussion":
      return {
        cards: discussionCards.map((card) => ({
          titleKey: `${card.key}.title`,
          descriptionKey: `${card.key}.description`,
          href: card.link,
          image: card.img,
          count: discussionMeta[card.key]?.count,
          countKey: "content.cardsCount",
          level: discussionMeta[card.key]?.level,
          levelTone: "green",
        })),
        isLoading: false,
        isError: false,
      };

    case "grammar":
      return {
        cards: (grammarQuery.data?.lessons ?? [])
          .slice(0, limit)
          .map(toLessonCard),
        isLoading: access === "loading" || grammarQuery.isPending,
        isError: grammarQuery.isError,
      };

    default:
      return { cards: [], isLoading: false, isError: false };
  }
};
