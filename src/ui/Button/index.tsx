"use client";
import { FC } from "react";
import styles from "./styles.module.css";
import { Spinner } from "@nextui-org/react";

type TButtonProps = {
  text?: string;
  onClick?: () => void;
  kind?: "primary" | "secondary";
  fullWidth?: boolean;
  mediumHeight?: boolean;
  type?: "submit";
  isLoading?: boolean;
};

export const Button: FC<TButtonProps> = ({
  text,
  onClick = () => {},
  kind = "primary",
  fullWidth,
  mediumHeight,
  type,
  isLoading,
}) => {
  const className = `${styles.mainButton} ${
    kind === "secondary" && styles.secondary
  } ${fullWidth && styles.fullWidth} ${mediumHeight && styles.mediumHeight}`;

  if (isLoading) {
    return (
      <div className={`${className} flex flex-1 items-center justify-center`}>
        <Spinner color="white" />
      </div>
    );
  }
  return (
    <button
      type={type}
      onClick={isLoading ? undefined : onClick}
      className={className}
    >
      {text}
    </button>
  );
};
