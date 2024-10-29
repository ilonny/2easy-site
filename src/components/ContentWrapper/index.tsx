import { PropsWithChildren } from "react";
import styles from "./styles.module.css";

export const ContentWrapper = ({ children }: PropsWithChildren) => {
  return <div className={styles.wrapper}>{children}</div>;
};
