import { PropsWithChildren } from "react";
import styles from "./styles.module.css";

export const Panel = ({
  children,
  style = {},
}: PropsWithChildren<{ style?: any }>) => {
  return (
    <div className={styles.wrapper} style={style}>
      {children}
    </div>
  );
};
