import { AuthContext } from "@/auth";
import { useContext } from "react";
import styles from "./styles.module.css";

export const ProfileImagePicker = () => {
  const { profile } = useContext(AuthContext);
  return (
    <div className="flex">
      <button className={styles["header-profile-short-wrapper"]}>
        <p className={styles.title}>{profile.name?.[0] || "A"}</p>
      </button>
    </div>
  );
};
