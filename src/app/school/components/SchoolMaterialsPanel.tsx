"use client";

import { Button, Spinner } from "@nextui-org/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BrandPill } from "@/components";
import { checkResponse, fetchDelete, fetchGet, fetchPostJson } from "@/api";
import { T } from "@/i18n/T";

type Material = {
  id: number;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  source?: string | null;
  shared?: boolean;
};

type TProps = {
  schoolId: number;
  canManage?: boolean;
  teacherUserId?: number;
  readOnly?: boolean;
  personalOnly?: boolean;
};

type MaterialsPayload = {
  success?: boolean;
  materials?: Material[];
  school_materials?: Material[];
  personal_materials?: Material[];
  lessons?: Material[];
};

const rowsFrom = (
  data: MaterialsPayload | null | undefined,
  scope: "school" | "personal",
): Material[] => {
  const candidates =
    scope === "school"
      ? [data?.materials, data?.school_materials, data?.lessons]
      : [data?.materials, data?.personal_materials, data?.lessons];
  return (
    candidates
      .find((value) => Array.isArray(value))
      ?.filter((row) => Number(row?.id) > 0) || []
  );
};

export const SchoolMaterialsPanel = ({
  schoolId,
  canManage,
  teacherUserId,
  readOnly,
  personalOnly,
}: TProps) => {
  const [tab, setTab] = useState<"school" | "personal">(
    personalOnly ? "personal" : "school",
  );
  const [schoolMaterials, setSchoolMaterials] = useState<Material[]>([]);
  const [personalMaterials, setPersonalMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const teacherQuery = teacherUserId
        ? `&teacher_user_id=${teacherUserId}`
        : "";
      const [schoolRes, personalRes] = await Promise.all([
        fetchGet({
          path: `/school/${schoolId}/materials?scope=school${teacherQuery}`,
          isSecure: true,
          schoolId,
        }),
        fetchGet({
          path: `/school/${schoolId}/materials?scope=personal${teacherQuery}`,
          isSecure: true,
          schoolId,
        }),
      ]);
      const [schoolData, personalData] = await Promise.all([
        schoolRes.json(),
        personalRes.json(),
      ]);
      const apiSupported = schoolRes.status !== 404 && personalRes.status !== 404;
      setSupported(apiSupported);
      if (schoolData?.success !== false) {
        setSchoolMaterials(rowsFrom(schoolData, "school"));
      } else {
        setSchoolMaterials([]);
      }
      if (personalData?.success !== false) {
        setPersonalMaterials(rowsFrom(personalData, "personal"));
      } else if (!teacherUserId) {
        // Old backend: a teacher can still see their own and 2easy catalog.
        const fallback = await fetchGet({
          path: "/lessons",
          isSecure: true,
          workspaceScope: "personal",
        });
        const fallbackData = await fallback.json();
        setPersonalMaterials(rowsFrom(fallbackData, "personal"));
      } else {
        setPersonalMaterials([]);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, teacherUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateShare = async (materialId: number, share: boolean) => {
    const response = share
      ? await fetchPostJson({
          path: `/school/${schoolId}/materials`,
          isSecure: true,
          schoolId,
          data: { lesson_id: materialId },
        })
      : await fetchDelete({
          path: `/school/${schoolId}/materials/${materialId}`,
          isSecure: true,
          schoolId,
        });
    const data = await response.json();
    checkResponse(data);
    if (data?.success) await load();
  };

  const rows = tab === "school" ? schoolMaterials : personalMaterials;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-brand text-brand-black">
          <T k="school.materialsTitle" />
        </h2>
        <p className="mt-1 text-sm text-brand-grayFont">
          <T k="school.materialsHint" />
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!personalOnly ? (
          <BrandPill active={tab === "school"} onClick={() => setTab("school")}>
            <T k="school.materialsSchool" />
          </BrandPill>
        ) : null}
        <BrandPill
          active={tab === "personal"}
          onClick={() => setTab("personal")}
        >
          <T k="school.materialsPersonal" />
        </BrandPill>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rows.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((material) => (
            <article
              key={material.id}
              className="flex min-w-0 flex-col gap-3 rounded-[16px] bg-white p-4 ring-1 ring-black/5"
            >
              <Link
                href={`/lessons/${material.id}`}
                className="line-clamp-2 font-semibold text-brand-black hover:text-brand-violet"
              >
                {material.title || <T k="schedule.defaultLessonTitle" />}
              </Link>
              {material.description ? (
                <p className="line-clamp-2 text-sm text-brand-grayFont">
                  {material.description}
                </p>
              ) : null}
              {canManage && !readOnly && supported ? (
                <Button
                  size="sm"
                  variant="flat"
                  className="self-start"
                  onPress={() =>
                    void updateShare(material.id, tab === "personal")
                  }
                >
                  <T
                    k={
                      tab === "personal"
                        ? "school.materialsShare"
                        : "school.materialsRemove"
                    }
                  />
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-[16px] bg-brand-gray/40 px-4 py-8 text-center text-sm text-brand-grayFont">
          <T
            k={
              supported
                ? "school.materialsEmpty"
                : "school.materialsUnavailable"
            }
          />
        </p>
      )}
    </section>
  );
};
