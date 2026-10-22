"use client";

import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { FC, useMemo, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import { toast } from "react-toastify";
import {
  browserTimezone,
  timezoneOptions,
} from "../lib/timezones";
import type { SchoolSettings } from "../types";
import { SchoolAvatarPicker } from "./SchoolAvatarPicker";

type CreatePayload = {
  name: string;
  settings: Partial<SchoolSettings> & { timezone: string };
  avatarFile?: File | null;
};

type TProps = {
  onCreate: (payload: CreatePayload) => Promise<any>;
};

export const CreateSchoolForm: FC<TProps> = ({ onCreate }) => {
  const zones = useMemo(() => timezoneOptions(), []);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(browserTimezone());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast(i18n.t("school.nameRequired"), { type: "error" });
      return;
    }
    if (!timezone) {
      toast(i18n.t("school.timezoneRequired"), { type: "error" });
      return;
    }
    setLoading(true);
    try {
      const settings: CreatePayload["settings"] = {
        timezone,
        defaultLessonMinutes: 60,
      };
      const res = await onCreate({
        name: name.trim(),
        settings,
        avatarFile,
      });
      if (res?.success) {
        toast(i18n.t("school.created"), { type: "success" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4 rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="text-xl font-bold tracking-brand text-brand-black">
        <T k="school.createTitle" />
      </h2>
      <p className="text-sm text-brand-grayFont">
        <T k="school.createHint" />
      </p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        label={<T k="school.nameLabel" />}
        radius="lg"
        size="lg"
        variant="flat"
      />
      <SchoolAvatarPicker
        name={name}
        file={avatarFile}
        disabled={loading}
        onFileChange={setAvatarFile}
      />
      <Select
        label={<T k="school.timezoneLabel" />}
        selectedKeys={timezone ? [timezone] : []}
        onChange={(e) => setTimezone(e.target.value)}
        radius="lg"
        size="lg"
        variant="flat"
      >
        {zones.map((z) => (
          <SelectItem key={z} value={z}>
            {z}
          </SelectItem>
        ))}
      </Select>
      <Button
        className={brandPrimaryBtnClassName}
        isLoading={loading}
        onPress={submit}
      >
        <T k="school.createAction" />
      </Button>
    </div>
  );
};
