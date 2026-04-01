import { PropsWithChildren } from "react";
import styles from "./styles.module.css";

export const ContentWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className={`${styles.wrapper} px-4 md:px-6 lg:px-4`}>
      {children}
    </div>
  );
};
