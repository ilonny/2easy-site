"use client";
import { FC } from "react";
import styles from "./styles.module.css";

type TButtonProps = {
  text?: string;
  onClick?: () => void;
  kind?: "primary" | "secondary";
};

export const Button: FC<TButtonProps> = ({
  text,
  onClick = () => {},
  kind = "primary",
}) => {
  return (
    <button onClick={onClick} className={`${styles.mainButton} ${kind === "secondary" && styles.secondary}`}>
      {text}
    </button>
  );
};
