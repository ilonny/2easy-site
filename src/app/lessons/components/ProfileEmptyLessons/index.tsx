import Bg from "@/assets/images/wide_bg_empty.png";
import { Button } from "@nextui-org/react";
import { FC } from "react";

type TProps = {
  title: string;
  buttonTitle: string;
  onButtonPress: () => void;
  hideButton?: boolean;
};

export const ProfileEmptyLessons: FC<TProps> = ({
  title,
  buttonTitle,
  onButtonPress,
  hideButton,
}) => {
  return (
    <div
      className="w-full h-[225px] flex justify-center items-center flex-col gap-7"
      style={{
        background: `url(${Bg.src}) center center no-repeat #fff`,
        backgroundSize: "cover",
      }}
    >
      <p className="text-center">{title}</p>
      {!hideButton && (
        <Button
          size="lg"
          color="primary"
          style={{ minWidth: 310 }}
          onClick={onButtonPress}
        >
          {buttonTitle}
        </Button>
      )}
    </div>
  );
};
