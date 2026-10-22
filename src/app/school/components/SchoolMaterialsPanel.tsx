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
    () => ({
      workspaceScope: "school" as const,
      schoolId,
      teacherUserId: personalOnly ? teacherUserId : undefined,
    }),
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
                : "school.materialsTitle"
            }
          />
        </h2>
        {!personalOnly ? (
          <p className="mt-1 text-sm text-brand-grayFont">
            <T k="school.materialsHint" />
          </p>
        ) : null}
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
