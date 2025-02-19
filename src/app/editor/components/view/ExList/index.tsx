import React, { FC, useMemo } from "react";
import { ImageExView } from "../ImageExView";
import styles from "./style.module.css";
import ArrowUpIcon from "@/assets/icons/editor_arrow_up.svg";
import EditIcon from "@/assets/icons/edit.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import Image from "next/image";
import { Divider } from "@nextui-org/react";

type TProps = {
  list: Array<any>;
  onPressEdit: (ex: any) => void;
  changeSortIndex: (exId: number, newIndex: number) => void;
  onPressDelete: (exId: number) => void;
};

const mapComponent = (type: string) => {
  switch (type) {
    case "image":
      return (props) => <ImageExView {...props} />;
    default:
      break;
  }
};

export const ExList: FC<TProps> = ({
  list,
  onPressEdit,
  changeSortIndex,
  onPressDelete,
}) => {
  return (
    <div className="flex flex-col gap-10">
      {list.map((ex, exIndex) => {
        const Viewer = mapComponent(ex.type);
        return (
          <div className={`${styles["wrapper"]}`} key={ex.id}>
            <Viewer data={ex.data} />
            <div className={`${styles["edit-wrapper"]} p-4`}>
              <div className="flex justify-end gap-2">
                {exIndex !== 0 && (
                  <div
                    onClick={() => {
                      //up
                      console.log("list", exIndex);
                      if (list[exIndex - 1]) {
                        const prevEx = list[exIndex - 1];
                        changeSortIndex(prevEx.id, prevEx.sortIndex + 1);
                      }
                      changeSortIndex(ex.id, ex.sortIndex - 1);
                    }}
                    className="flex justify-center items-center bg-white w-[40px] h-[40px] rounded-[10px]"
                    style={{
                      boxShadow: "0px 8px 24px 0px #908BA826",
                      cursor: "pointer",
                    }}
                  >
                    <Image src={ArrowUpIcon} alt="arrow icon" />
                  </div>
                )}
                {exIndex < list.length - 1 && (
                  <div
                    onClick={() => {
                      //down
                      console.log("list 2", exIndex);
                      if (list[exIndex + 1]) {
                        const next = list[exIndex + 1];
                        console.log("next???", next);
                        changeSortIndex(next.id, next.sortIndex - 1);
                      }
                      changeSortIndex(ex.id, ex.sortIndex + 1);
                    }}
                    className="flex justify-center items-center bg-white w-[40px] h-[40px] rounded-[10px]"
                    style={{
                      boxShadow: "0px 8px 24px 0px #908BA826",
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={ArrowUpIcon}
                      alt="arrow icon"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </div>
                )}
              </div>
              <div className="h-4" />
              <div
                className="p-4 bg-white w-[260px] rounded-[10px]"
                style={{
                  boxShadow: "0px 8px 24px 0px #908BA826",
                  cursor: "pointer",
                }}
              >
                <div
                  className="flex justify-between items-center"
                  onClick={() => onPressEdit(ex)}
                >
                  <p>Редактировать задание</p>
                  <Image src={EditIcon} alt="arrow icon" />
                </div>
                <Divider className="my-2" />
                <div
                  className="flex justify-between items-center"
                  onClick={() => onPressDelete(ex.id)}
                >
                  <p style={{ color: "#A42929" }}>Удалить задание</p>
                  <Image src={DeleteIcon} alt="arrow icon" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
