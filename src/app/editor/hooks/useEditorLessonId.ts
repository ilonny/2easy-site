"use client";

import { useContext } from "react";
import { useParams } from "next/navigation";
import { EditorContext } from "@/app/editor/context";

/** lesson_id for upload hooks: context override (AI modal) or route param */
export const useEditorLessonId = () => {
  const params = useParams();
  const { lessonIdOverride } = useContext(EditorContext);
  return lessonIdOverride ?? params?.id;
};
