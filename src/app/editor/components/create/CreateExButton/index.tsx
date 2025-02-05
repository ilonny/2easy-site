import { Button, Card } from "@nextui-org/react";
import styles from "./styles.module.css";
import { FC } from "react";

type TProps = {
  onPress: () => void;
};

export const CreateExButton: FC<TProps> = ({ onPress }) => {
  return (
    <Card
      className={`${styles["wrapper"]} p-5 h-[180px] items-center justify-center`}
      radius="lg"
      shadow="none"
    >
      <Button size="lg" onClick={onPress} color="primary" className="min-w-[310px]">
        Добавить задание
      </Button>
    </Card>
  );
};
