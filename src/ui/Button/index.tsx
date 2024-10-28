"use client";
import { FC } from "react";
import styles from "./styles.module.css";

type TButtonProps = {
  text?: string;
  onClick?: () => void;
  kind?: "primary" | "secondary";
  fullWidth?: boolean;
  mediumHeight?: boolean;
  type?: 'submit'
};

export const Button: FC<TButtonProps> = ({
  text,
  onClick = () => {},
  kind = "primary",
  fullWidth,
  mediumHeight,
  type
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.mainButton} ${
        kind === "secondary" && styles.secondary
      } ${fullWidth && styles.fullWidth} ${
        mediumHeight && styles.mediumHeight
      }`}
    >
      {text}
    </button>
  );
};
