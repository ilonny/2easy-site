import { PropsWithChildren } from "react";

export const Title = ({ children }: PropsWithChildren) => {
  return (
    <h1 className={"text-primary font-bold text-3xl uppercase"}>{children}</h1>
  );
};
