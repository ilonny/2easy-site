"use client";

import { AuthContext } from "@/auth";
import { UserAvatar } from "@/components/UserAvatar";
import { useCallback, useContext, useRef, useState } from "react";
import { checkResponse, fetchPostMultipart } from "@/api";
import { writeToLocalStorage } from "@/auth/utils";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import { T } from "@/i18n/T";
import styles from "./styles.module.css";

type TProps = {
  onAvatarChange?: (avatar: string) => void;
};

export const ProfileImagePicker = ({ onAvatarChange }: TProps) => {
  const { profile, setProfile } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = useCallback(() => {
    if (uploading) return;
    inputRef.current?.click();
  }, [uploading]);

  const onFile = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error(i18n.t("profile.avatarInvalidType"));
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetchPostMultipart({
          path: "/profile/avatar",
          data: fd,
          isSecure: true,
        });
        const json = await res.json();
        checkResponse(json);
        if (json?.profile && setProfile) {
          setProfile(json.profile);
          writeToLocalStorage("profile", JSON.stringify(json.profile));
        }
        if (json?.avatar) {
          onAvatarChange?.(json.avatar);
        }
        toast.success(i18n.t("profile.avatarUpdated"));
      } catch {
        toast.error(i18n.t("commonErrors.somethingWentWrong"));
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onAvatarChange, setProfile],
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        className={styles["header-profile-short-wrapper"]}
        onClick={onPick}
        disabled={uploading}
        aria-label={i18n.t("profile.changeAvatar")}
      >
        <UserAvatar
          name={profile?.name}
          avatar={profile?.avatar}
          size={140}
        />
        <span className={styles.avatarOverlay}>
          {uploading ? "…" : <T k="profile.changePhoto" />}
        </span>
      </button>
      <p className="text-sm text-default-500 text-center max-w-[200px]">
        <T k="profile.avatarHint" />
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
};
