/* eslint-disable @next/next/no-img-element */
import { FC, useCallback, useContext } from "react";
import { TNoteData } from "../../editor/Note/types";
import "./styles.scss";
import InfoIcon from "@/assets/icons/note_info_icon.svg";
import EyeEnabledIcon from "@/assets/icons/eye_enable.svg";
import EyeDisabledIcon from "@/assets/icons/eye_disabled.svg";
import Image from "next/image";
import { useUploadNoteEx } from "../../editor/hooks/useUploadNoteEx";
import { AuthContext } from "@/auth";
type TProps = {
  data: TNoteData;
  isPreview?: boolean;
  onChangeIsVisible: () => void;
  changeData?: (key: string, val: boolean | string) => void;
};

export const NoteExView: FC<TProps> = ({
  data,
  isPreview = false,
  onChangeIsVisible,
  changeData,
}) => {
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const { saveNoteEx } = useUploadNoteEx(data.sortIndex);
  const onClickEye = useCallback(async () => {
    if (typeof onChangeIsVisible === "function") {
      await saveNoteEx({
        ...data,
        isVisible: !data.isVisible,
      });
      onChangeIsVisible();
      return;
    }
    if (typeof changeData === "function") {
      changeData("isVisible", !data.isVisible);
      return;
    }
  }, [data, saveNoteEx, onChangeIsVisible, changeData]);

  // if (!isTeacher && !data.isVisible) {
  //   return <></>;
  // }

  return (
    <div
      className="flex items-start justify-between gap-2 py-8"
      style={{
        margin: "0 auto",
        maxWidth: 780,
      }}
    >
      <div
        style={{
          // margin: "0 auto",
          maxWidth: 630,
          width: "100%",
          background: "#EEEBFF",
          padding: 40,
          borderRadius: 10,
        }}
      >
        <div className="flex items-center gap-4">
          <Image src={InfoIcon} alt="info icon" className="shrink-0" />
          <div
            style={{ flex: 1, fontWeight: 700, fontSize: 22, color: "#8580A1" }}
          >
            {data.title}
          </div>
        </div>
        {data.description && (
          <p
            className="mt-2"
            style={{
              fontSize: 18,
              color: "#8580A1",
              whiteSpace: "break-spaces",
              wordBreak: "break-word",
            }}
          >
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
};
