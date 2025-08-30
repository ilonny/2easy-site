import { Button } from "@nextui-org/react";
import Link from "next/link";

export const HeaderMenuList = () => {
  return (
    <div className="
      flex
      flex-col
      lg:flex-row
      lg:items-center
      lg:justify-center
      lg:gap-3
      lg:mx-8
      lg:py-2
      lg:pb-6
    ">
      {/* <Link href="/about_us">
        <Button variant="light" className="font-bold">
          ABOUT US
        </Button>
      </Link> */}
      <Link href="/lessons_plans">
        <Button variant="light" className="font-bold">
          LESSONS PLANS
        </Button>
      </Link>
      <Link href="/speaking_games">
        <Button variant="light" className="font-bold">
          SPEAKING GAMES
        </Button>
      </Link>
      <Link href="/cards">
        <Button variant="light" className="font-bold">
          DISCUSSION CARDS
        </Button>
      </Link>

      <Link href="/grammar">
        <Button variant="light" className="font-bold">
          GRAMMAR
        </Button>
      </Link>
      <Link href="/subscription">
        <Button variant="light" className="font-bold">
          ПОДПИСКА
        </Button>
      </Link>
    </div>
  );
};
