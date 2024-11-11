import { Button } from "@nextui-org/react";
import Link from "next/link";

export const HeaderMenuList = () => {
  return (
    <div className="mx-8 flex items-center justify-center gap-3 py-2 pb-6">
      <Button variant="light" className="font-bold">
        ABOUT US
      </Button>
      <Button variant="light" className="font-bold">
        LESSONS PLANS
      </Button>
      <Button variant="light" className="font-bold">
        GAMES & DISCUSSION CARDS
      </Button>
      <Button variant="light" className="font-bold">
        GRAMMAR
      </Button>
      <Link href="/subscription">
        <Button variant="light" className="font-bold">
          ПОДПИСКА
        </Button>
      </Link>
    </div>
  );
};
