"use client";

import { Button } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { toast } from "react-toastify";

type TProps = {
  name: string;
  avatar?: string | null;
  file?: File | null;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
  onRemove?: () => void;
};

export const SchoolAvatarPicker = ({
  name,
  avatar,
  file,
  disabled,
  onFileChange,
  onRemove,
}: TProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <UserAvatar name={name} avatar={preview || avatar} size={72} />
      <div className="flex flex-col items-start gap-1">
        <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="flat"
          isDisabled={disabled}
          onPress={() => inputRef.current?.click()}
        >
          <T k="school.chooseAvatar" />
        </Button>
        {onRemove && (avatar || file) ? (
          <Button
            size="sm"
            variant="light"
            isDisabled={disabled}
            onPress={() => {
              onFileChange(null);
              if (avatar) onRemove();
            }}
          >
            <T k="school.removeAvatar" />
          </Button>
        ) : null}
        </div>
        <span className="text-xs text-brand-grayFont">
          <T k="school.avatarHint" />
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(event) => {
          const next = event.target.files?.[0] || null;
          event.target.value = "";
          if (next && !next.type.startsWith("image/")) {
            toast.error(i18n.t("profile.avatarInvalidType"));
            return;
          }
          onFileChange(next);
        }}
      />
    </div>
  );
};
