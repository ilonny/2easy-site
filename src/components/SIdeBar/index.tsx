import { AuthContext } from "@/auth";
import { Button, Skeleton } from "@nextui-org/react";
import { FC, useContext } from "react";
import { HeaderProfile } from "../HeaderProfile";
import Link from "next/link";
import { HeaderMenuList } from "../HeaderMenuList";

type TProps = {
  isOpened: boolean;
};

export const SideBar: FC<TProps> = ({ isOpened }) => {
  const { profile, authIsLoading } = useContext(AuthContext);
  return (
    <div
      className={`top-[80px] left-0 fixed w-[100%] h-[100%] bg-white p-4 ${
        !isOpened && "hidden"
      }`}
    >
      <HeaderMenuList />
    </div>
  );
};
