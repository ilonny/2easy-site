"use client";

import { fetchDelete, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useState } from "react";
import type {
  ScheduleAvailability,
  SelectedScheduleRange,
} from "../types";
import type { ScheduleWorkspace } from "./useScheduleEvents";

const EMPTY: ScheduleAvailability = {
  supported: false,
  workingHours: [],
  unavailable: [],
};

export const useTeacherAvailability = (workspace?: ScheduleWorkspace) => {
  const workspaceScope = workspace?.workspaceScope;
  const schoolId = workspace?.schoolId;
  const [availability, setAvailability] =
    useState<ScheduleAvailability>(EMPTY);
  const [loading, setLoading] = useState(false);

  const loadAvailability = useCallback(
    async (from: string, to: string, teacherUserId?: number | null) => {
      if (workspaceScope !== "school" || !schoolId) {
        setAvailability(EMPTY);
        return EMPTY;
      }
      const qs = new URLSearchParams({ from, to });
      if (teacherUserId) {
        qs.set("teacher_user_id", String(teacherUserId));
      }
      try {
        const [intervalResponse, hoursResponse] = await Promise.all([
          fetchGet({
            path: `/school/${schoolId}/unavailability?${qs.toString()}`,
            isSecure: true,
            workspaceScope,
            schoolId,
          }),
          teacherUserId
            ? fetchGet({
                path: `/school/${schoolId}/members/${teacherUserId}/hours`,
                isSecure: true,
                workspaceScope,
                schoolId,
              })
            : Promise.resolve(null),
        ]);
        const [intervalJson, hoursJson] = await Promise.all([
          intervalResponse.json(),
          hoursResponse?.json(),
        ]);
        if (!intervalJson?.success) {
          setAvailability(EMPTY);
          return EMPTY;
        }
        const next: ScheduleAvailability = {
          supported: true,
          workingHours: hoursJson?.success ? hoursJson.hours || [] : [],
          unavailable: intervalJson.intervals || [],
        };
        setAvailability(next);
        return next;
      } catch {
        setAvailability(EMPTY);
        return EMPTY;
      }
    },
    [workspaceScope, schoolId],
  );

  const markInactive = useCallback(
    async (
      ranges: SelectedScheduleRange[],
      teacherUserId?: number | null,
    ) => {
      setLoading(true);
      try {
        if (workspaceScope !== "school" || !schoolId) {
          return { success: false };
        }
        const response = await fetchPostJson({
          path: `/school/${schoolId}/unavailability`,
          isSecure: true,
          workspaceScope,
          schoolId,
          data: {
            intervals: ranges,
            ...(teacherUserId ? { teacher_user_id: teacherUserId } : {}),
          },
        });
        return await response.json();
      } finally {
        setLoading(false);
      }
    },
    [workspaceScope, schoolId],
  );

  const markActive = useCallback(
    async (
      ranges: SelectedScheduleRange[],
      teacherUserId?: number | null,
    ) => {
      setLoading(true);
      try {
        if (workspaceScope !== "school" || !schoolId) {
          return { success: false };
        }
        if (!ranges.length) {
          return { success: true, deleted_count: 0 };
        }
        const response = await fetchDelete({
          path: `/school/${schoolId}/unavailability`,
          isSecure: true,
          workspaceScope,
          schoolId,
          data: {
            intervals: ranges,
            ...(teacherUserId ? { teacher_user_id: teacherUserId } : {}),
          },
        });
        return await response.json();
      } finally {
        setLoading(false);
      }
    },
    [workspaceScope, schoolId],
  );

  return {
    availability,
    loading,
    loadAvailability,
    markInactive,
    markActive,
  };
};
