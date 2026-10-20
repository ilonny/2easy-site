"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { colorForStudent } from "../types";
import styles from "../styles.module.css";

type Student = { id: number; name?: string; email?: string };

type TProps = {
  students: Student[];
  filterStudentId: number | null;
  onFilter: (id: number | null) => void;
  onCreate: () => void;
  canCreate: boolean;
  open?: boolean;
};

const studentLabel = (s: Student) =>
  String(s.name || "").trim() ||
  String(s.email || "").trim() ||
  `#${s.id}`;

export const StudentSidebar = ({
  students,
  filterStudentId,
  onFilter,
  onCreate,
  canCreate,
  open,
}: TProps) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const hay = `${s.name || ""} ${s.email || ""} ${s.id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [students, query]);

  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
    >
      {canCreate && (
        <Button color="primary" className="w-full font-semibold" onPress={onCreate}>
          <T k="schedule.newLesson" />
        </Button>
      )}
      <div>
        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#86868b]">
          <T k="schedule.studentsFilter" />
        </div>
        <Input
          size="sm"
          radius="lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={i18n.t("school.searchStudent")}
          className="mb-2"
          classNames={{
            inputWrapper: "bg-white min-h-9 h-9",
          }}
          isClearable
          onClear={() => setQuery("")}
        />
        <button
          type="button"
          className={`${styles.studentItem} ${
            filterStudentId == null ? styles.studentItemActive : ""
          }`}
          onClick={() => onFilter(null)}
        >
          <span className={styles.dot} style={{ background: "#8e8e93" }} />
          <T k="schedule.allStudents" />
        </button>
        {filtered.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.studentItem} ${
              filterStudentId === s.id ? styles.studentItemActive : ""
            }`}
            onClick={() => onFilter(s.id)}
          >
            <span
              className={styles.dot}
              style={{ background: colorForStudent(s.id) }}
            />
            <span className="truncate">{studentLabel(s)}</span>
          </button>
        ))}
        {!filtered.length && (
          <p className="px-2 py-3 text-xs text-[#86868b]">
            <T k="school.searchNoResults" />
          </p>
        )}
      </div>
    </aside>
  );
};
