"use client";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  brandModalClassNames,
  brandPrimaryBtnClassName,
} from "@/components/brandUi";
import { toast } from "react-toastify";
import { checkResponse, fetchGet, fetchPatch, fetchPostJson } from "@/api";
import {
  SCHOOL_ROLE_OPTIONS,
  SchoolMember,
  SchoolRole,
} from "../types";
import { WorkingHoursEditor } from "./WorkingHoursEditor";

type TProps = {
  canManage: boolean;
  canEditHours?: boolean;
  schoolId: number;
  /** Refresh active staff list used by other school tabs (e.g. student assign). */
  onActiveMembersChanged?: () => void;
};

const roleLabel = (role: string) => i18n.t(`school.roles.${role}`);

export const MembersPanel: FC<TProps> = ({
  canManage,
  canEditHours,
  schoolId,
  onActiveMembersChanged,
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState<SchoolMember | null>(null);
  const [hoursMember, setHoursMember] = useState<SchoolMember | null>(null);
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<SchoolRole[]>(["teacher"]);
  const [saving, setSaving] = useState(false);

  const loadMembers = useCallback(
    async (archived: boolean) => {
      setLoading(true);
      try {
        const res = await fetchGet({
          path: archived
            ? `/school/${schoolId}/members?archived=1`
            : `/school/${schoolId}/members`,
          isSecure: true,
        });
        const data = await res.json();
        if (data?.success) {
          setMembers(data.members || []);
        } else {
          // Expected for roles without staff directory — don't toast
          if (res.status !== 403) checkResponse(data);
          setMembers([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [schoolId],
  );

  useEffect(() => {
    void loadMembers(showArchived);
  }, [loadMembers, showArchived]);

  const sorted = useMemo(
    () =>
      [...members].sort((a, b) =>
        (a.user?.name || a.user?.login || "").localeCompare(
          b.user?.name || b.user?.login || "",
        ),
      ),
    [members],
  );

  const resetForm = () => {
    setLogin("");
    setName("");
    setSurname("");
    setPassword("");
    setRoles(["teacher"]);
    setEditMember(null);
  };

  const submitCreate = async () => {
    if (!login.trim() || !roles.length) {
      toast(i18n.t("school.memberFormInvalid"), { type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetchPostJson({
        path: `/school/${schoolId}/members`,
        isSecure: true,
        data: {
          login: login.trim(),
          name: name.trim() || undefined,
          surname: surname.trim() || undefined,
          password: password.trim() || undefined,
          roles,
        },
      });
      const data = await res.json();
      if (data?.success) {
        if (data.linkedExisting) {
          toast(
            data.restored
              ? i18n.t("school.memberRestoredFromArchive")
              : i18n.t("school.memberLinkedExisting"),
            { type: "success" },
          );
        } else if (data.password || data.member?.password) {
          toast(
            i18n.t("school.memberCreatedWithPassword", {
              password: data.member?.password || data.password,
            }),
            { type: "success" },
          );
        } else {
          toast(i18n.t("school.memberCreated"), { type: "success" });
        }
        setOpen(false);
        resetForm();
        setShowArchived(false);
        await loadMembers(false);
        onActiveMembersChanged?.();
      } else {
        checkResponse(data);
      }
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!editMember || !roles.length) return;
    setSaving(true);
    try {
      const res = await fetchPatch({
        path: `/school/${schoolId}/members/${editMember.id}`,
        isSecure: true,
        data: { roles },
      });
      const data = await res.json();
      if (data?.success) {
        toast(i18n.t("school.rolesUpdated"), { type: "success" });
        setEditMember(null);
        resetForm();
        await loadMembers(showArchived);
        onActiveMembersChanged?.();
      } else {
        checkResponse(data);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (memberId: number, archive: boolean) => {
    const res = await fetchPatch({
      path: `/school/${schoolId}/members/${memberId}`,
      isSecure: true,
      data: { status: archive ? "disabled" : "active" },
    });
    const data = await res.json();
    if (data?.success) {
      toast(
        archive
          ? i18n.t("school.memberArchived")
          : i18n.t("school.memberUnarchived"),
        { type: "success" },
      );
      await loadMembers(showArchived);
      onActiveMembersChanged?.();
    } else {
      checkResponse(data);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-brand text-brand-black">
          <T k="school.membersTitle" />
        </h2>
        {canManage && !showArchived && (
          <Button
            className={brandPrimaryBtnClassName}
            onPress={() => {
              resetForm();
              setOpen(true);
            }}
          >
            <T k="school.addMember" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          radius="full"
          color="primary"
          variant={!showArchived ? "solid" : "bordered"}
          onClick={() => setShowArchived(false)}
          size="sm"
        >
          <T k="school.activeTab" />
        </Button>
        <Button
          radius="full"
          color="primary"
          variant={showArchived ? "solid" : "bordered"}
          onClick={() => setShowArchived(true)}
          size="sm"
        >
          <T k="school.archivedTab" />
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
                <T k="school.colLogin" />
              </th>
              <th className="px-4 py-3 font-medium">
                <T k="school.colRoles" />
              </th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  {[m.user?.name, m.user?.surname].filter(Boolean).join(" ") ||
                    "—"}
                </td>
                <td className="px-4 py-3">{m.user?.login || "—"}</td>
                <td className="px-4 py-3">
                  {(m.roles || []).map(roleLabel).join(", ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {m.can_open_cabinet && !showArchived && (
                      <Button
                        as={Link}
                        href={`/school/staff/${m.user_id}`}
                        size="sm"
                        variant="flat"
                      >
                        <T k="school.openStaffCabinet" />
                      </Button>
                    )}
                    {!showArchived && (canEditHours || m.can_open_cabinet) && (
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setHoursMember(m)}
                      >
                        <T k="school.editHours" />
                      </Button>
                    )}
                    {canManage && !showArchived && (
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => {
                          setEditMember(m);
                          setRoles([...(m.roles || [])] as SchoolRole[]);
                        }}
                      >
                        <T k="school.editRoles" />
                      </Button>
                    )}
                    {canManage && !m.roles?.includes("super_admin") && (
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => toggleArchive(m.id, !showArchived)}
                      >
                        {showArchived ? (
                          <T k="school.unarchive" />
                        ) : (
                          <T k="school.archive" />
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !sorted.length && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-brand-grayFont"
                >
                  {showArchived ? (
                    <T k="school.noArchivedMembers" />
                  ) : (
                    <T k="school.noMembers" />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        size="lg"
        isOpen={open}
        onClose={() => setOpen(false)}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T k="school.addMember" />
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 pb-6">
            <Input
              label={<T k="school.memberLogin" />}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              radius="lg"
              description={<T k="school.memberLoginHint" />}
            />
            <Input
              label={<T k="school.memberName" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              radius="lg"
              description={<T k="school.memberNameHint" />}
            />
            <Input
              label={<T k="school.memberSurname" />}
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              radius="lg"
            />
            <Input
              label={<T k="school.memberPassword" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              radius="lg"
              description={<T k="school.memberPasswordHint" />}
            />
            <CheckboxGroup
              label={<T k="school.colRoles" />}
              value={roles}
              onChange={(v) => setRoles(v as SchoolRole[])}
            >
              {SCHOOL_ROLE_OPTIONS.map((role) => (
                <Checkbox key={role} value={role}>
                  {roleLabel(role)}
                </Checkbox>
              ))}
            </CheckboxGroup>
            <Button
              className={brandPrimaryBtnClassName}
              isLoading={saving}
              onPress={submitCreate}
            >
              <T k="school.saveMember" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isOpen={!!editMember}
        onClose={() => {
          setEditMember(null);
          resetForm();
        }}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T k="school.editRoles" />
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 pb-6">
            <CheckboxGroup
              label={<T k="school.colRoles" />}
              value={roles}
              onChange={(v) => setRoles(v as SchoolRole[])}
            >
              {(editMember?.roles?.includes("super_admin")
                ? (["super_admin", ...SCHOOL_ROLE_OPTIONS] as SchoolRole[])
                : SCHOOL_ROLE_OPTIONS
              ).map((role) => (
                <Checkbox
                  key={role}
                  value={role}
                  isDisabled={role === "super_admin"}
                >
                  {roleLabel(role)}
                </Checkbox>
              ))}
            </CheckboxGroup>
            <Button
              className={brandPrimaryBtnClassName}
              isLoading={saving}
              onPress={submitEdit}
            >
              <T k="school.saveRoles" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isOpen={!!hoursMember}
        onClose={() => setHoursMember(null)}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T k="school.workingHoursTitle" />
            {hoursMember?.user
              ? `: ${
                  [hoursMember.user.name, hoursMember.user.surname]
                    .filter(Boolean)
                    .join(" ") || hoursMember.user.login
                }`
              : ""}
          </ModalHeader>
          <ModalBody className="pb-6">
            {hoursMember ? (
              <WorkingHoursEditor
                schoolId={schoolId}
                userId={hoursMember.user_id}
                compact
              />
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
