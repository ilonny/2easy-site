"use client";

import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SchoolInfo, SchoolMember, SchoolTier } from "../types";
import {
  getActiveSchoolId,
  resolveActiveSchoolId,
  setActiveSchoolId,
} from "../lib/activeSchool";

export const useSchool = () => {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [activeSchoolId, setActiveSchoolIdState] = useState<number | null>(
    null,
  );
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tiers, setTiers] = useState<SchoolTier[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [subscription, setSubscription] = useState<SchoolInfo["subscription"]>(
    null,
  );

  const school = useMemo(
    () => schools.find((s) => s.id === activeSchoolId) || schools[0] || null,
    [schools, activeSchoolId],
  );

  const selectSchool = useCallback((schoolId: number) => {
    setActiveSchoolId(schoolId);
    setActiveSchoolIdState(schoolId);
  }, []);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGet({ path: "/school/me", isSecure: true });
      const data = await res.json();
      if (data?.success) {
        const list: SchoolInfo[] = data.schools || [];
        setSchools(list);
        const resolved = resolveActiveSchoolId(
          list.map((s) => s.id),
          getActiveSchoolId(),
        );
        setActiveSchoolIdState(resolved);
      } else {
        checkResponse(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchool = useCallback(
    async (payload: {
      name: string;
      settings?: {
        timezone: string;
        workingHours?: {
          enabled: boolean;
          days: Array<{ dow: number; start: string; end: string }>;
        };
        defaultLessonMinutes?: number;
      };
    }) => {
      const res = await fetchPostJson({
        path: "/school",
        isSecure: true,
        data: {
          name: payload.name,
          settings: payload.settings,
          timezone: payload.settings?.timezone,
        },
      });
      const data = await res.json();
      if (data?.success) {
        const newId = data.school?.id;
        if (newId) {
          setActiveSchoolId(Number(newId));
          setActiveSchoolIdState(Number(newId));
        }
        await refreshMe();
        return data;
      }
      checkResponse(data);
      return data;
    },
    [refreshMe],
  );

  /** Staff list — only for roles with canSeeTeachers / canManageMembers. */
  const refreshMembers = useCallback(async (schoolId: number) => {
    const res = await fetchGet({
      path: `/school/${schoolId}/members`,
      isSecure: true,
    });
    const data = await res.json();
    if (data?.success) {
      setMembers(data.members || []);
      return;
    }
    setMembers([]);
    // Plain teachers get 403 here — don't toast on expected denial
    if (res.status !== 403) checkResponse(data);
  }, []);

  const refreshStudents = useCallback(async (schoolId: number) => {
    const res = await fetchGet({
      path: `/school/${schoolId}/students`,
      isSecure: true,
    });
    const data = await res.json();
    if (data?.success) {
      setStudents(data.students || []);
    } else {
      setStudents([]);
      if (res.status !== 403) checkResponse(data);
    }
  }, []);

  const createStudent = useCallback(
    async (
      schoolId: number,
      payload: {
        name: string;
        email?: string;
        tag?: string;
        teacher_user_id?: number;
      },
    ) => {
      const res = await fetchPostJson({
        path: `/school/${schoolId}/students`,
        isSecure: true,
        data: payload,
      });
      const data = await res.json();
      if (data?.success) {
        await refreshStudents(schoolId);
        return data;
      }
      checkResponse(data);
      return data;
    },
    [refreshStudents],
  );

  const refreshSubscription = useCallback(async (schoolId: number) => {
    const res = await fetchGet({
      path: `/school/${schoolId}/subscription`,
      isSecure: true,
    });
    const data = await res.json();
    if (data?.success) {
      setSubscription(data.subscription || null);
      setStudentCount(data.student_count || 0);
      setTiers(data.tiers || []);
      return data;
    }
    if (res.status !== 403) checkResponse(data);
    return data;
  }, []);

  const createSchoolPayment = useCallback(
    async (schoolId: number, tier: string, email?: string, phone?: string) => {
      const res = await fetchPostJson({
        path: `/school/${schoolId}/payment/create`,
        isSecure: true,
        data: { tier, email, phone },
      });
      const data = await res.json();
      if (!data?.success) {
        checkResponse(data);
      }
      return data;
    },
    [],
  );

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (!school?.id) return;
    void refreshStudents(school.id);
    void refreshSubscription(school.id);
    const canLoadMembers =
      !!school.access?.canSeeTeachers || !!school.access?.canManageMembers;
    if (canLoadMembers) {
      void refreshMembers(school.id);
    } else {
      setMembers([]);
    }
  }, [
    school?.id,
    school?.access?.canSeeTeachers,
    school?.access?.canManageMembers,
    refreshMembers,
    refreshStudents,
    refreshSubscription,
  ]);

  return {
    loading,
    school,
    schools,
    activeSchoolId,
    selectSchool,
    members,
    students,
    tiers,
    studentCount,
    subscription,
    refreshMe,
    createSchool,
    refreshMembers,
    refreshStudents,
    createStudent,
    refreshSubscription,
    createSchoolPayment,
  };
};
