/* eslint-disable @next/next/no-img-element */
import { FC, useCallback } from "react";
import { TNoteData } from "../../editor/Note/types";
import "./styles.scss";
import InfoIcon from "@/assets/icons/note_info_icon.svg";
import EyeEnabledIcon from "@/assets/icons/eye_enable.svg";
import EyeDisabledIcon from "@/assets/icons/eye_disabled.svg";
import Image from "next/image";
import { useUploadNoteEx } from "../../editor/hooks/useUploadNoteEx";
type TProps = {
  data: TNoteData;
  isPreview?: boolean;
  onChangeVisible: () => {};
};

export const NoteExView: FC<TProps> = ({
  data,
  isPreview = false,
  onChangeIsVisible,
}) => {
  console.log("onChangeIsVisible????", onChangeIsVisible);
  const { saveNoteEx } = useUploadNoteEx(data.sortIndex);
  const onClickEye = useCallback(async () => {
    await saveNoteEx({
      ...data,
      isVisible: !data.isVisible,
    });
    onChangeIsVisible();
  }, [data, saveNoteEx, onChangeIsVisible]);
  console.log("data", data);
  return (
    <div
      className="flex items-start justify-between gap-2 py-8"
      style={{
        margin: "0 auto",
        maxWidth: 780,
      }}
    >
      <div style={{ width: 55 }}></div>
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
          <p className="mt-2" style={{ fontSize: 18, color: "#8580A1" }}>
            {data.description}
          </p>
        )}
      </div>
      <div style={{ width: 55 }}>
        <div
          className="flex flex-col items-end gap-2"
          style={{ cursor: "pointer" }}
          onClick={() => onClickEye()}
        >
          <Image
            src={data.isVisible ? EyeEnabledIcon : EyeDisabledIcon}
            alt=""
          />
          <p
            style={{
              color: data.isVisible ? "#3F28C6" : "#B3B3B3",
              fontSize: 12,
              textAlign: "right",
              lineHeight: "100%",
            }}
          >
            {data.isVisible
              ? "заметка видна ученику"
              : "заметка не видна ученику"}
          </p>
        </div>
      </div>
    </div>
  );
};
