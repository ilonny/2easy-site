"use client";

import { Button } from "@nextui-org/react";
import { T } from "@/i18n/T";
import { colorForStudent } from "../types";
import styles from "../styles.module.css";

type Student = { id: number; name?: string };

type TProps = {
  students: Student[];
  filterStudentId: number | null;
  onFilter: (id: number | null) => void;
  onCreate: () => void;
  canCreate: boolean;
  open?: boolean;
};

export const StudentSidebar = ({
  students,
  filterStudentId,
  onFilter,
  onCreate,
  canCreate,
  open,
}: TProps) => {
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
        {students.map((s) => (
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
            <span className="truncate">{s.name || `#${s.id}`}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
