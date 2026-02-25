import { AuthContext } from "@/auth";
import { useContext } from "react";
import styles from "./styles.module.css";

export const ProfileImagePicker = () => {
  const { profile } = useContext(AuthContext);
  console.log("4fghf99tf", profile);
  return (
    <div className="flex">
      <button className={styles["header-profile-short-wrapper"]}>
        {profile?.id === 1864 ? (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={
              "https://608dfa18-3eae-4574-a997-0a7441c16d33.selstorage.ru/uploads/1/IMG_8359%20(1).jpg"
            }
            style={{ borderRadius: 300 }}
          />
        ) : (
          <p className={styles.title}>{profile.name?.[0] || "A"}</p>
        )}
      </button>
    </div>
  );
};
