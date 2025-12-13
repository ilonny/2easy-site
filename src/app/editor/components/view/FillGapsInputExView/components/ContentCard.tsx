import React, { FC } from "react";
import { Card } from "@nextui-org/react";

const ContentCard: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={`py-8 w-[100%] max-w-[886px] m-auto`}>
      <Card className={`p-10 px-10 `}>
        <div style={{ margin: "0 auto", lineHeight: "230%" }} className="flex flex-col gap-10">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default ContentCard;
