import { SubscribeCounter } from "@/subscribe/components";
import { HeaderProfile as HeaderProfileShort } from "@/profile/components";

export const HeaderProfile = () => {
  return (
    <div className="flex flex-row items-center">
      <SubscribeCounter />
      <div className="ml-4">
        <HeaderProfileShort />
      </div>
    </div>
  );
};
