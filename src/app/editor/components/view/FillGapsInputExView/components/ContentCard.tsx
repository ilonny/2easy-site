import React, { FC } from "react";
import { Card } from "@nextui-org/react";

const ContentCard: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="py-8 w-full max-w-[886px] mx-auto">
      <Card className="p-10 px-10">
        <div className="mx-auto leading-[230%] flex flex-col gap-10">{children}</div>
      </Card>
    </div>
  );
};

export default ContentCard;
