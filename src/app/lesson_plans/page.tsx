"use client";

import { CatalogPageShell } from "@/components";
import { Image } from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import { ProfileLessons } from "../lessons/components/ProfileLessons";
import { T } from "@/i18n/T";
import { AuthContext } from "@/auth";
import Dino from "@/assets/images/dino.gif";
import {
  CatalogWorkspaceProvider,
  PERSONAL_CATALOG_WORKSPACE,
} from "@/app/school/lib/catalogWorkspace";
import { useTeacherPlan } from "@/app/subscription/helpers";
import { SchoolMaterialsPanel } from "@/app/school/components/SchoolMaterialsPanel";
import { fetchGet } from "@/api";
import { getActiveSchoolId } from "@/app/school/lib/activeSchool";

export default function LessonPlansPage() {
  const { authIsLoading, profile } = useContext(AuthContext);
  const { schoolOnly, loading: planLoading } = useTeacherPlan();
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [schoolReady, setSchoolReady] = useState(false);

  useEffect(() => {
    if (authIsLoading || planLoading) return;
    if (!schoolOnly) {
      setSchoolId(null);
      setSchoolReady(true);
      return;
    }
    const fromProfile = Number(profile?.schoolId) || 0;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchGet({ path: "/school/me", isSecure: true });
        const data = await res?.json();
        const ids = (Array.isArray(data?.schools) ? data.schools : [])
          .map((school: { id?: number }) => Number(school?.id))
          .filter((id: number) => id > 0);
        const active = getActiveSchoolId();
        const next =
          (active && ids.includes(active) ? active : 0) ||
          (ids.includes(fromProfile) ? fromProfile : 0) ||
          ids[0] ||
          0;
        if (!cancelled) setSchoolId(next > 0 ? next : null);
      } catch {
        if (!cancelled) setSchoolId(null);
      } finally {
        if (!cancelled) setSchoolReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authIsLoading, planLoading, profile?.schoolId, schoolOnly]);

  const waiting =
    authIsLoading || planLoading || (schoolOnly && !schoolReady);

  return (
    <CatalogPageShell title={<T k="header.lessonPlans" />}>
      {waiting ? (
        <div className="flex h-[500px] w-full items-center justify-center">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      ) : schoolOnly && schoolId ? (
        <SchoolMaterialsPanel schoolId={schoolId} personalOnly canManage />
      ) : (
        <CatalogWorkspaceProvider value={PERSONAL_CATALOG_WORKSPACE}>
          <ProfileLessons />
        </CatalogWorkspaceProvider>
      )}
    </CatalogPageShell>
  );
}
