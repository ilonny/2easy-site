"use client";

import { getImageUrl } from "@/app/editor/helpers";
import styles from "./styles.module.css";

type TProps = {
  name?: string | null;
  avatar?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

const getInitials = (name?: string | null) => {
  if (!name?.trim()) return "A";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "A"
  );
};

export const UserAvatar = ({
  name,
  avatar,
  size = 48,
  className,
  style,
}: TProps) => {
  const src = avatar
    ? /^(blob:|data:)/i.test(avatar)
      ? avatar
      : getImageUrl(avatar)
    : "";
  const fontSize = Math.max(12, Math.round(size * 0.38));

  return (
    <div
      className={`${styles.avatar} ${className || ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: size,
        fontSize,
        ...style,
      }}
      aria-hidden={!name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={styles.image} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
    </div>
  );
};
