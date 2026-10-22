"use client";

import { CatalogPageShell, BrandPill } from "@/components";
import { withLogin } from "@/auth/hooks/withLogin";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/auth";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSchool } from "./hooks/useSchool";
import { CreateSchoolForm } from "./components/CreateSchoolForm";
import { MembersPanel } from "./components/MembersPanel";
import { StudentsPanel } from "./components/StudentsPanel";
import { StatsPanel } from "./components/StatsPanel";
import { SchedulePanel } from "./components/SchedulePanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { SchoolMaterialsPanel } from "./components/SchoolMaterialsPanel";
import {
  isSchoolTab,
  readLastSchoolTab,
  type SchoolTab,
  writeLastSchoolTab,
} from "./lib/schoolTab";

export default function SchoolPage() {
  withLogin();
  const { profile, authIsLoading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    loading,
    school,
    schools,
    selectSchool,
    members,
    students,
    createSchool,
    createStudent,
    refreshSubscription,
    refreshMembers,
    refreshStudents,
    refreshMe,
  } = useSchool();

  const requestedTab = searchParams.get("tab");
  const urlTab = isSchoolTab(requestedTab) ? requestedTab : null;
  const [tab, setTabState] = useState<SchoolTab>(urlTab || "stats");
  const [showCreate, setShowCreate] = useState(false);

  const canManage = !!school?.access?.canManageMembers;
  const canAssign = !!school?.access?.canSeeAllStudents;
  const canSeeStaff =
    !!school?.access?.canSeeTeachers || !!school?.access?.canManageMembers;
  const canSettings =
    !!school?.access?.canManageSchool ||
    !!school?.access?.canManageSchoolSettings;
  const canEditHours = !!school?.access?.canEditAnyTeacherHours;
  const canSeeMaterials = !!school?.access?.canAccessMaterials;
  const isSuperAdmin = !!school?.roles?.includes("super_admin");
  const canManageLibrary =
    !!school?.access?.canManageSchoolLibrary ||
    isSuperAdmin ||
    !!school?.roles?.some((role) =>
      ["head_teacher", "methodist", "academic_director"].includes(role),
    );

  const setTab = useCallback(
    (nextTab: SchoolTab) => {
      writeLastSchoolTab(nextTab);
      setTabState(nextTab);
      const query = new URLSearchParams(searchParams.toString());
      query.set("tab", nextTab);
      router.replace(`${pathname}?${query.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (authIsLoading) return;
    if (profile?.isStudent || profile?.studentId) {
      const studentId = Number(profile.studentId);
      router.replace(
        studentId > 0 ? `/student-account/${studentId}` : "/",
      );
    }
  }, [authIsLoading, profile?.isStudent, profile?.studentId, router]);

  useEffect(() => {
    if (urlTab) {
      setTabState(urlTab);
      writeLastSchoolTab(urlTab);
      return;
    }
    const stored = readLastSchoolTab();
    if (stored) setTab(stored);
  }, [setTab, urlTab]);

  // Wait until school access is loaded — otherwise members/settings reset to stats.
  useEffect(() => {
    if (loading || !school) return;
    if (tab === "members" && !canSeeStaff) setTab("stats");
    if (tab === "settings" && !canSettings) setTab("stats");
    if (tab === "materials" && !canSeeMaterials) setTab("stats");
  }, [
    loading,
    school,
    tab,
    canSeeStaff,
    canSettings,
    canSeeMaterials,
    setTab,
  ]);

  if (loading || profile?.isStudent || profile?.studentId) {
    return (
      <CatalogPageShell title={<T k="school.title" />}>
        <p className="text-center text-brand-grayFont">
          <T k="school.loading" />
        </p>
      </CatalogPageShell>
    );
  }

  if (!school || showCreate) {
    return (
      <CatalogPageShell
        title={<T k="school.title" />}
        subtitle={<T k="school.subtitleCreate" />}
      >
        <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4">
          {!!schools.length && (
            <Button variant="light" onPress={() => setShowCreate(false)}>
              <T k="school.backToSchool" />
            </Button>
          )}
          <CreateSchoolForm
            onCreate={async (payload) => {
              const res = await createSchool(payload);
              if (res?.success) setShowCreate(false);
              return res;
            }}
          />
        </div>
      </CatalogPageShell>
    );
  }

  const rolesLabel = (school.roles || [])
    .map((r) => i18n.t(`school.roles.${r}`))
    .join(", ");

  return (
    <CatalogPageShell
      title={school.name}
      subtitle={
        <T k="school.subtitleRoles" values={{ roles: rolesLabel }} />
      }
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
        {schools.length > 1 ? (
          <Select
            label={<T k="school.switchSchool" />}
            selectedKeys={[String(school.id)]}
            onChange={(e) => {
              const id = Number(e.target.value);
              if (id) selectSchool(id);
            }}
            className="max-w-[420px]"
          >
            {schools.map((s) => (
              <SelectItem key={String(s.id)} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </Select>
        ) : null}

        <div className="flex flex-wrap justify-center gap-1.5 min-[1200px]:gap-3">
          <BrandPill
            active={tab === "stats"}
            onClick={() => setTab("stats")}
          >
            <T k="school.tabStats" />
          </BrandPill>
          <BrandPill
            active={tab === "schedule"}
            onClick={() => setTab("schedule")}
          >
            <T k="school.tabSchedule" />
          </BrandPill>
          {canSeeStaff ? (
            <BrandPill
              active={tab === "members"}
              onClick={() => setTab("members")}
            >
              <T k="school.tabMembers" />
            </BrandPill>
          ) : null}
          <BrandPill
            active={tab === "students"}
            onClick={() => setTab("students")}
          >
            <T k="school.tabStudents" />
          </BrandPill>
          {canSeeMaterials ? (
            <BrandPill
              active={tab === "materials"}
              onClick={() => setTab("materials")}
            >
              <T k="school.tabMaterials" />
            </BrandPill>
          ) : null}
          {canSettings ? (
            <BrandPill
              active={tab === "settings"}
              onClick={() => setTab("settings")}
            >
              <T k="school.tabSettings" />
            </BrandPill>
          ) : null}
        </div>

        {tab === "stats" && <StatsPanel schoolId={school.id} />}

        {tab === "schedule" && (
          <SchedulePanel
            schoolId={school.id}
            members={members}
            canFilterTeachers={!!school.access?.canSeeAllSchedule}
          />
        )}

        {tab === "members" && canSeeStaff && (
          <MembersPanel
            canManage={canManage}
            canEditHours={canEditHours || !!school.access?.canTeach}
            schoolId={school.id}
            onActiveMembersChanged={() => refreshMembers(school.id)}
          />
        )}

        {tab === "students" && (
          <StudentsPanel
            schoolId={school.id}
            canManageAssign={canAssign}
            defaultLessonMinutes={
              school.settings?.defaultLessonMinutes || 60
            }
            timezone={school.settings?.timezone}
            students={students}
            members={members}
            onStudentsChanged={() =>
              Promise.all([
                refreshStudents(school.id),
                refreshSubscription(school.id),
              ])
            }
            onCreate={(payload) => createStudent(school.id, payload)}
          />
        )}

        {tab === "materials" && canSeeMaterials && (
          <div className="flex flex-col gap-10">
            <SchoolMaterialsPanel
              schoolId={school.id}
              canManage={canManageLibrary}
            />
            {school.access?.canTeach ? (
              <SchoolMaterialsPanel
                schoolId={school.id}
                personalOnly
                canManage
              />
            ) : null}
          </div>
        )}

        {tab === "settings" && canSettings && (
          <SettingsPanel
            schoolId={school.id}
            canEdit={canSettings}
            canEditAvatar={isSuperAdmin}
            avatar={school.avatar}
            onSaved={() => void refreshMe()}
          />
        )}

        <div className="border-t border-black/5 pt-6 text-center">
          <button
            type="button"
            className="text-xs text-brand-grayFont underline-offset-2 hover:underline"
            onClick={() => setShowCreate(true)}
          >
            <T k="school.createAnother" />
          </button>
        </div>
      </div>
    </CatalogPageShell>
  );
}
