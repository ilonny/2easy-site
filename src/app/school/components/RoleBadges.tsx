"use client";

import i18n from "@/i18n/config";
import type { SchoolRole } from "../types";

const roleStyles: Record<SchoolRole, string> = {
  super_admin: "bg-violet-100 text-violet-800 ring-violet-200",
  academic_director: "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200",
  head_teacher: "bg-blue-100 text-blue-800 ring-blue-200",
  methodist: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  manager: "bg-amber-100 text-amber-800 ring-amber-200",
  teacher: "bg-slate-100 text-slate-700 ring-slate-200",
};

const roleWeight: Record<SchoolRole, number> = {
  super_admin: 60,
  academic_director: 50,
  methodist: 40,
  head_teacher: 30,
  manager: 20,
  teacher: 10,
};

export const RoleBadges = ({ roles }: { roles?: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {[...(roles || [])]
      .sort(
        (a, b) =>
          (roleWeight[b as SchoolRole] || 0) -
          (roleWeight[a as SchoolRole] || 0),
      )
      .map((role) => (
        <span
          key={role}
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
            roleStyles[role as SchoolRole] || roleStyles.teacher
          }`}
        >
          {i18n.t(`school.roles.${role}`)}
        </span>
      ))}
  </div>
);
