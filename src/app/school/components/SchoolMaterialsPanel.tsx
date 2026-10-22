"use client";

import { useMemo } from "react";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { CatalogWorkspaceProvider } from "../lib/catalogWorkspace";
import { T } from "@/i18n/T";

type TProps = {
  schoolId: number;
  canManage?: boolean;
  teacherUserId?: number;
  readOnly?: boolean;
  personalOnly?: boolean;
};

export const SchoolMaterialsPanel = ({
  schoolId,
  canManage,
  teacherUserId,
  readOnly,
  personalOnly,
}: TProps) => {
  const workspace = useMemo(
    () =>
      personalOnly
        ? {
            workspaceScope: "personal" as const,
            schoolId,
            teacherUserId,
            studentScope: "school" as const,
          }
        : {
            workspaceScope: "school" as const,
            schoolId,
          },
    [personalOnly, schoolId, teacherUserId],
  );

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-brand text-brand-black">
          <T
            k={
              personalOnly
                ? "school.materialsPersonal"
                : "school.materialsSchool"
            }
          />
        </h2>
        <p className="mt-1 text-sm text-brand-grayFont">
          <T
            k={
              personalOnly
                ? "school.materialsPersonalHint"
                : canManage
                  ? "school.materialsHint"
                  : "school.materialsHintTeacher"
            }
          />
        </p>
      </div>
      <CatalogWorkspaceProvider value={workspace}>
        <ProfileLessons
          canCreateLesson={!!canManage && !readOnly}
          stayOnPage
        />
      </CatalogWorkspaceProvider>
    </section>
  );
};
