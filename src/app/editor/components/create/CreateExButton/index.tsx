import { Button, Card, Divider } from "@nextui-org/react";
import styles from "./styles.module.css";
import { FC, useEffect, useState } from "react";
import { readFromLocalStorage, writeToLocalStorage } from "@/auth/utils";
import Image from "next/image";
import PasteIcon from "@/assets/icons/paste.svg";
import { fetchPostJson } from "@/api";

type TProps = {
  onPress: () => void;
  onSuccessCreate: (id: number) => void;
  lesson_id: string;
  currentSortIndexToShift: number;
};

export const CreateExButton: FC<TProps> = ({
  onPress,
  onSuccessCreate,
  currentSortIndexToShift,
  lesson_id,
}) => {
  const [copyData, setCopyData] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const exCopyData = readFromLocalStorage("exCopy");
      setCopyData(exCopyData || "");
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card
      className={`${styles["wrapper"]} p-5 h-[180px] items-center justify-center`}
      radius="lg"
      shadow="none"
    >
      <Button
        size="lg"
        onClick={onPress}
        color="primary"
        className="min-w-[310px]"
      >
        Добавить задание
      </Button>
      {!!copyData && (
        <div className={`${styles["edit-wrapper"]} p-4`}>
          <div
            className="p-4 bg-white w-[260px] rounded-[10px]"
            style={{
              boxShadow: "0px 8px 24px 0px #908BA826",
              cursor: "pointer",
            }}
          >
            <div
              className="flex justify-between items-center"
              onClick={async () => {
                const copyObj = JSON.parse(copyData);
                const res = await fetchPostJson({
                  path: "/ex/copy",
                  isSecure: true,
                  data: {
                    ...copyObj,
                    lesson_id,
                    currentSortIndexToShift,
                  },
                });
                const data = await res.json();
                if (typeof onSuccessCreate === "function") {
                  onSuccessCreate(data?.id);
                }
                writeToLocalStorage("exCopy", "");
              }}
            >
              <p>Вставить задание</p>
              <Image src={PasteIcon} alt="arrow icon" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
