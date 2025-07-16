import { SubscribeCounter } from "@/subscribe/components";
import { HeaderProfile as HeaderProfileShort } from "@/profile/components";

type TProps = {
  isStudent?: boolean;
};

export const HeaderProfile = (props: TProps) => {
  const { isStudent } = props;
  return (
    <div className="flex flex-row items-center">
      <div className="hidden lg:block">{!props.isStudent && <SubscribeCounter />}</div>
      <div className="ml-4">
        <HeaderProfileShort isStudent={isStudent} />
      </div>
    </div>
  );
};
