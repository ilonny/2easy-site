"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  brandModalClassNames,
  brandPrimaryBtnClassName,
} from "@/components/brandUi";
import { SearchableSelect } from "@/components/SearchableSelect";
import { toast } from "react-toastify";
import { fetchGet } from "@/api";
import {
  AvailableTeacher,
  DOW_ORDER,
  LESSON_DURATIONS,
  SchoolMember,
} from "../types";

type LessonFrequency = "weekly" | "biweekly" | "once";

type PreferredSlotRow = {
  id: string;
  /** For weekly/biweekly */
  dow: number;
  /** For once */
  date: string;
  start: string;
};

type TProps = {
  schoolId: number;
  canManageAssign: boolean;
  defaultLessonMinutes?: number;
  timezone?: string;
  students: any[];
  members: SchoolMember[];
  onCreate: (payload: {
    name: string;
    email?: string;
    tag?: string;
    teacher_user_id?: number;
  }) => Promise<any>;
};

const newSlotId = () =>
  `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const defaultSlot = (): PreferredSlotRow => ({
  id: newSlotId(),
  dow: 1,
  date: "",
  start: "10:00",
});

export const StudentsPanel: FC<TProps> = ({
  schoolId,
  canManageAssign,
  defaultLessonMinutes = 60,
  timezone,
  students,
  members,
  onCreate,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tag, setTag] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [frequency, setFrequency] = useState<LessonFrequency>("weekly");
  const [slots, setSlots] = useState<PreferredSlotRow[]>([defaultSlot()]);
  const [duration, setDuration] = useState(defaultLessonMinutes);
  const [available, setAvailable] = useState<AvailableTeacher[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [saving, setSaving] = useState(false);

  const teachers = useMemo(
    () =>
      members.filter(
        (m) =>
          m.status === "active" &&
          (m.roles.includes("teacher") ||
            m.roles.includes("head_teacher") ||
            m.roles.includes("methodist") ||
            m.roles.includes("academic_director") ||
            m.roles.includes("super_admin")),
      ),
    [members],
  );

  const teacherName = (userId: string | number | undefined) => {
    const m = members.find((x) => String(x.user_id) === String(userId));
    if (!m?.user) return String(userId || "—");
    return (
      [m.user.name, m.user.surname].filter(Boolean).join(" ") || m.user.login
    );
  };

  const formatTeacher = (t: {
    user_id: number;
    name?: string | null;
    surname?: string | null;
    login?: string;
    free_minutes_day?: number;
  }) => {
    const label =
      [t.name, t.surname].filter(Boolean).join(" ") ||
      t.login ||
      String(t.user_id);
    if (t.free_minutes_day != null) {
      return `${label} (${Math.round(t.free_minutes_day / 60)}h free)`;
    }
    return label;
  };

  const slotsReady = useMemo(() => {
    if (!slots.length) return false;
    if (frequency === "once") {
      return slots.every(
        (s) =>
          /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
          /^([01]\d|2[0-3]):([0-5]\d)$/.test(s.start),
      );
    }
    return slots.every(
      (s) =>
        Number.isInteger(s.dow) &&
        s.dow >= 0 &&
        s.dow <= 6 &&
        /^([01]\d|2[0-3]):([0-5]\d)$/.test(s.start),
    );
  }, [slots, frequency]);

  const slotsQueryKey = useMemo(() => {
    if (!slotsReady) return "";
    if (frequency === "once") {
      return slots.map((s) => `${s.date}@${s.start}`).join("|");
    }
    return slots.map((s) => `${s.dow}:${s.start}`).join(",");
  }, [slots, frequency, slotsReady]);

  useEffect(() => {
    if (!open || !canManageAssign || !slotsReady) {
      setAvailable([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoadingAvail(true);
      try {
        const q = new URLSearchParams({
          frequency,
          duration_minutes: String(duration),
        });
        if (frequency === "once") {
          const payload = slots.map((s) => ({
            date: s.date,
            start: s.start,
          }));
          q.set("slots", JSON.stringify(payload));
        } else {
          q.set(
            "slots",
            slots.map((s) => `${s.dow}:${s.start}`).join(","),
          );
        }
        const res = await fetchGet({
          path: `/school/${schoolId}/teachers/available?${q}`,
          isSecure: true,
        });
        const data = await res.json();
        if (!cancelled && data?.success) {
          setAvailable(data.teachers || []);
        }
      } finally {
        if (!cancelled) setLoadingAvail(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [
    open,
    canManageAssign,
    slotsReady,
    slotsQueryKey,
    frequency,
    duration,
    schoolId,
    slots,
  ]);

  const teacherItems = useMemo(() => {
    if (!canManageAssign) return [];
    if (!showAllTeachers && slotsReady) {
      return available.map((t) => ({
        id: String(t.user_id),
        label: formatTeacher(t),
        description: t.login,
      }));
    }
    return teachers.map((t) => ({
      id: String(t.user_id),
      label:
        [t.user?.name, t.user?.surname].filter(Boolean).join(" ") ||
        t.user?.login ||
        String(t.user_id),
      description: t.user?.login,
    }));
  }, [
    canManageAssign,
    showAllTeachers,
    slotsReady,
    available,
    teachers,
  ]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setTag("");
    setTeacherId("");
    setFrequency("weekly");
    setSlots([defaultSlot()]);
    setShowAllTeachers(false);
    setAvailable([]);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast(i18n.t("school.studentNameRequired"), { type: "error" });
      return;
    }
    if (canManageAssign && !teacherId) {
      toast(i18n.t("school.teacherRequired"), { type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await onCreate({
        name: name.trim(),
        email: email.trim() || undefined,
        tag: tag.trim() || undefined,
        teacher_user_id: teacherId ? Number(teacherId) : undefined,
      });
      if (res?.success) {
        toast(
          res.password
            ? i18n.t("school.studentCreatedWithPassword", {
                password: res.password,
              })
            : i18n.t("school.studentCreated"),
          { type: "success" },
        );
        setOpen(false);
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-brand text-brand-black">
          <T k="school.studentsTitle" />
        </h2>
        <Button
          className={brandPrimaryBtnClassName}
          onPress={() => {
            setDuration(defaultLessonMinutes);
            setOpen(true);
          }}
        >
          <T k="school.addStudent" />
        </Button>
      </div>

      <div className="overflow-hidden rounded-[16px] ring-1 ring-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-gray text-brand-grayFont">
            <tr>
              <th className="px-4 py-3 font-medium">
                <T k="school.colName" />
              </th>
              <th className="px-4 py-3 font-medium">
                <T k="school.colEmail" />
              </th>
              <th className="px-4 py-3 font-medium">
                <T k="school.colTeacher" />
              </th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-black/5">
                <td className="px-4 py-3">{s.name || "—"}</td>
                <td className="px-4 py-3">{s.email || "—"}</td>
                <td className="px-4 py-3">{teacherName(s.user_id)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/student-account/${s.id}`}
                    className="font-medium text-brand-violet hover:underline"
                  >
                    <T k="school.openCabinet" />
                  </Link>
                </td>
              </tr>
            ))}
            {!students.length && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-brand-grayFont"
                >
                  <T k="school.noStudents" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        size="2xl"
        isOpen={open}
        onClose={() => setOpen(false)}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T k="school.addStudent" />
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 pb-6">
            <Input
              label={<T k="school.studentName" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              radius="lg"
            />
            <Input
              label={<T k="school.studentEmail" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              radius="lg"
            />
            <Input
              label={<T k="school.studentTag" />}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              radius="lg"
            />
            {canManageAssign && (
              <>
                <p className="text-sm text-brand-grayFont">
                  <T
                    k="school.desiredSlotHint"
                    values={{ tz: timezone || "—" }}
                  />
                </p>
                <div className="flex flex-wrap gap-3">
                  <Select
                    label={<T k="school.lessonFrequency" />}
                    selectedKeys={[frequency]}
                    className="max-w-[200px]"
                    onChange={(e) => {
                      const v = e.target.value as LessonFrequency;
                      if (v) setFrequency(v);
                    }}
                  >
                    <SelectItem key="weekly" value="weekly">
                      {i18n.t("school.frequencyWeekly")}
                    </SelectItem>
                    <SelectItem key="biweekly" value="biweekly">
                      {i18n.t("school.frequencyBiweekly")}
                    </SelectItem>
                    <SelectItem key="once" value="once">
                      {i18n.t("school.frequencyOnce")}
                    </SelectItem>
                  </Select>
                  <Select
                    label={<T k="school.desiredDuration" />}
                    selectedKeys={[String(duration)]}
                    className="max-w-[140px]"
                    onChange={(e) =>
                      setDuration(Number(e.target.value) || 60)
                    }
                  >
                    {LESSON_DURATIONS.map((d) => (
                      <SelectItem key={String(d)} value={String(d)}>
                        {i18n.t("school.minutes", { n: d })}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  {slots.map((slot, index) => (
                    <div
                      key={slot.id}
                      className="flex flex-wrap items-end gap-2 rounded-[12px] bg-brand-gray/40 px-3 py-2"
                    >
                      {frequency === "once" ? (
                        <Input
                          type="date"
                          label={<T k="school.desiredDate" />}
                          value={slot.date}
                          onChange={(e) =>
                            setSlots((prev) =>
                              prev.map((s) =>
                                s.id === slot.id
                                  ? { ...s, date: e.target.value }
                                  : s,
                              ),
                            )
                          }
                          className="max-w-[180px]"
                          radius="lg"
                          size="sm"
                        />
                      ) : (
                        <Select
                          label={<T k="school.desiredWeekday" />}
                          selectedKeys={[String(slot.dow)]}
                          className="max-w-[140px]"
                          size="sm"
                          onChange={(e) => {
                            const dow = Number(e.target.value);
                            if (!Number.isInteger(dow)) return;
                            setSlots((prev) =>
                              prev.map((s) =>
                                s.id === slot.id ? { ...s, dow } : s,
                              ),
                            );
                          }}
                        >
                          {DOW_ORDER.map((d) => (
                            <SelectItem key={String(d)} value={String(d)}>
                              {i18n.t(`school.dow.${d}`)}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                      <Input
                        type="time"
                        label={<T k="school.desiredTime" />}
                        value={slot.start}
                        onChange={(e) =>
                          setSlots((prev) =>
                            prev.map((s) =>
                              s.id === slot.id
                                ? { ...s, start: e.target.value }
                                : s,
                            ),
                          )
                        }
                        className="max-w-[140px]"
                        radius="lg"
                        size="sm"
                      />
                      {slots.length > 1 ? (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() =>
                            setSlots((prev) =>
                              prev.filter((s) => s.id !== slot.id),
                            )
                          }
                        >
                          <T k="school.removeSlot" />
                        </Button>
                      ) : null}
                      {index === 0 && frequency !== "once" ? (
                        <span className="pb-2 text-xs text-brand-grayFont">
                          <T k="school.slotIndexHint" />
                        </span>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="flat"
                    className="self-start"
                    onPress={() =>
                      setSlots((prev) => [
                        ...prev,
                        {
                          ...defaultSlot(),
                          start:
                            prev[prev.length - 1]?.start || "10:00",
                        },
                      ])
                    }
                  >
                    <T k="school.addSlot" />
                  </Button>
                </div>

                {slotsReady && !showAllTeachers ? (
                  <p className="text-xs text-brand-grayFont">
                    {loadingAvail
                      ? i18n.t("school.loadingAvailable")
                      : i18n.t("school.availableCount", {
                          n: available.length,
                        })}
                  </p>
                ) : null}
                <SearchableSelect
                  label={<T k="school.colTeacher" />}
                  placeholder={i18n.t("school.searchTeacher")}
                  selectedId={teacherId || null}
                  onSelect={(id) => setTeacherId(id || "")}
                  items={teacherItems}
                />
                {slotsReady ? (
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setShowAllTeachers((v) => !v)}
                  >
                    {showAllTeachers ? (
                      <T k="school.showAvailableOnly" />
                    ) : (
                      <T k="school.showAllTeachers" />
                    )}
                  </Button>
                ) : null}
                {showAllTeachers && slotsReady ? (
                  <p className="text-xs text-amber-700">
                    <T k="school.forceTeacherWarning" />
                  </p>
                ) : null}
              </>
            )}
            <Button
              className={brandPrimaryBtnClassName}
              isLoading={saving}
              onPress={submit}
            >
              <T k="school.saveStudent" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
