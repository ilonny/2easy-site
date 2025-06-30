import { Checkbox } from "@nextui-org/react";

type TProps = {
  data: string[];
  title: string;
  isText?: boolean;
};

export const CheckboxList = (props: TProps) => {
  const { data, title, isText } = props;
  return (
    <div className="bg-white p-4">
      <p
        style={{
          fontSize: 20,
          textTransform: "uppercase",
          fontWeight: 700,
          color: "#3f28c6",
          marginBottom: 10,
        }}
      >
        {title}
      </p>
      <div className="flex items-start flex-wrap bg-white">
        {data.map((s) => {
          if (isText) {
            return (
              <div className="w-[100%] py-2" key={s}>
                <p>{s}</p>
              </div>
            );
          }
          return (
            <div className="w-[50%] py-2" key={s}>
              <Checkbox>{s}</Checkbox>
            </div>
          );
        })}
      </div>
    </div>
  );
};
