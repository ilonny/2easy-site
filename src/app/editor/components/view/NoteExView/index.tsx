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
      className="exercise-view-shell flex items-start justify-between gap-2 py-4 sm:py-6 md:py-7 lg:py-8 max-w-[780px]"
    >
      <div
        className="max-w-[630px] w-full rounded-[10px] bg-[#EEEBFF] p-4 sm:p-5 md:p-8 lg:p-10"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Image src={InfoIcon} alt="info icon" className="shrink-0" />
          <div className="flex-1 font-bold text-[#8580A1] text-lg sm:text-xl md:text-[22px]">
            {data.title}
          </div>
        </div>
        {data.description && (
          <p className="mt-2 text-base sm:text-lg text-[#8580A1] [white-space:break-spaces] break-words">
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
};
