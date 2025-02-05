import { Input, Textarea } from "@nextui-org/react";
import { FC } from "react";

type TProps = {
  value: string;
  setValue: (val: string) => void;
  label: string;
  isTextarea?: boolean;
  onColorChange?: (color: string) => void;
  selectedColor?: string;
};

export const TitleExInput: FC<TProps> = ({
  value,
  setValue,
  label,
  isTextarea = false,
  onColorChange,
  selectedColor,
}) => {
  return (
    <>
      <p className="font-light mb-2">{label}</p>
      <div>
        {isTextarea ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            classNames={{ inputWrapper: "bg-white", input: "min-h-[118px]" }}
          />
        ) : (
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              classNames={{ inputWrapper: "bg-white" }}
            />
            {!!onColorChange && (
              <input
                value={selectedColor}
                type="color"
                onChange={(e) => onColorChange(e.target.value)}
                style={{ height: 40 }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};
