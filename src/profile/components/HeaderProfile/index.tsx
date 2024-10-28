import { useContext } from "react";
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
export const HeaderProfile = () => {
  const { profile } = useContext(AuthContext);
  return (
    <button className={styles["header-profile-short-wrapper"]}>
      <p className={styles.title}>{profile.name?.[0] || 'A'}</p>
    </button>
  );
};
