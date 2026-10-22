"use client";

import { CatalogPageShell, BrandPill } from "@/components";
import { withLogin } from "@/auth/hooks/withLogin";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useCallback, useEffect, useState } from "react";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSchool } from "./hooks/useSchool";
import { CreateSchoolForm } from "./components/CreateSchoolForm";
import { MembersPanel } from "./components/MembersPanel";
import { StudentsPanel } from "./components/StudentsPanel";
import { TariffsPanel } from "./components/TariffsPanel";
import { StatsPanel } from "./components/StatsPanel";
import { SchedulePanel } from "./components/SchedulePanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { SchoolMaterialsPanel } from "./components/SchoolMaterialsPanel";

type SchoolTab =
  | "stats"
  | "schedule"
  | "members"
  | "students"
  | "materials"
  | "tariffs"
  | "settings";

export default function SchoolPage() {
  withLogin();
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
    tiers,
    studentCount,
    subscription,
    createSchool,
    createStudent,
    createSchoolPayment,
    refreshSubscription,
    refreshMembers,
    refreshMe,
  } = useSchool();

  const requestedTab = searchParams.get("tab") as SchoolTab | null;
  const tab: SchoolTab = [
    "stats",
    "schedule",
    "members",
    "students",
    "materials",
    "tariffs",
    "settings",
  ].includes(requestedTab || "")
    ? (requestedTab as SchoolTab)
    : "stats";
  const [showCreate, setShowCreate] = useState(false);

  const canManage = !!school?.access?.canManageMembers;
  const canPay = !!school?.access?.canPay;
  const canAssign = !!school?.access?.canSeeAllStudents;
  const canSeeStaff =
    !!school?.access?.canSeeTeachers || !!school?.access?.canManageMembers;
  const canSettings =
    !!school?.access?.canManageSchool ||
    !!school?.access?.canManageSchoolSettings;
  const canEditHours = !!school?.access?.canEditAnyTeacherHours;
  const canSeeMaterials = !!school?.access?.canAccessMaterials;
  const isSuperAdmin = !!school?.roles?.includes("super_admin");

  const setTab = useCallback(
    (nextTab: SchoolTab) => {
      const query = new URLSearchParams(searchParams.toString());
      query.set("tab", nextTab);
      router.replace(`${pathname}?${query.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Drop onto a visible tab if current one is hidden for this role
  useEffect(() => {
    if (tab === "members" && !canSeeStaff) setTab("stats");
    if (tab === "settings" && !canSettings) setTab("stats");
    if (tab === "materials" && !canSeeMaterials) setTab("stats");
  }, [tab, canSeeStaff, canSettings, canSeeMaterials, setTab]);

  if (loading) {
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
          <BrandPill
            active={tab === "tariffs"}
            onClick={() => setTab("tariffs")}
          >
            <T k="school.tabTariffs" />
          </BrandPill>
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
            onCreate={(payload) => createStudent(school.id, payload)}
          />
        )}

        {tab === "tariffs" && (
          <TariffsPanel
            canPay={canPay}
            schoolId={school.id}
            tiers={tiers}
            subscription={subscription || school.subscription}
            studentCount={studentCount}
            createSchoolPayment={createSchoolPayment}
            onPaid={() => {
              void refreshSubscription(school.id);
              void refreshMe();
            }}
          />
        )}

        {tab === "materials" && canSeeMaterials && (
          <SchoolMaterialsPanel
            schoolId={school.id}
            canManage={isSuperAdmin}
          />
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
