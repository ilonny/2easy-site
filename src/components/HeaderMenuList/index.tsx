import { Button, Tooltip } from "@nextui-org/react";
import Link from "next/link";

export const HeaderMenuList = () => {
  return (
    <div className="mx-8 flex items-center justify-center gap-3 py-2 pb-6">
      <Button variant="light" className="font-bold">
        ABOUT US
      </Button>
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
      {/* <Tooltip
        placement="bottom"
        content={
          <div className="">
            <Link href="/discussion_cards">
              <Button variant="light" className="font-bold" size="sm">
                DISCUSSION CARDS
              </Button>
            </Link>
            <br />
            <Link href="/controversial_statements">
              <Button variant="light" className="font-bold" size="sm">
                CONTROVERSIAL STATEMENTS
              </Button>
            </Link>
            <br />
            <Link href="/first_meeting">
              <Button variant="light" className="font-bold" size="sm">
                FIRST MEETING
              </Button>
            </Link>
            <br />
            <Link href="/never_have_i_ever">
              <Button variant="light" className="font-bold" size="sm">
                NEVER HAVE I EVER
              </Button>
            </Link>
            <br />
            <Link href="/would_you_rather">
              <Button variant="light" className="font-bold" size="sm">
                WOULD YOU RATHER
              </Button>
            </Link>
            <br />
            <Link href="/never_have_i_ever">
              <Button variant="light" className="font-bold" size="sm">
                NEVER HAVE I EVER
              </Button>
            </Link>
            <br />
            <Link href="/what_happens_next">
              <Button variant="light" className="font-bold" size="sm">
                WHAT HAPPENS NEXT
              </Button>
            </Link>
            <br />
            <Link href="/what_happens_next_films">
              <Button variant="light" className="font-bold" size="sm">
                WHAT HAPPENS NEXT FILMS & SERIES
              </Button>
            </Link>
            <br />
            <Link href="/name_three">
              <Button variant="light" className="font-bold" size="sm">
                NAME THREE
              </Button>
            </Link>
            <br />
            <Link href="/if_you_could">
              <Button variant="light" className="font-bold" size="sm">
                IF YOU COULD
              </Button>
            </Link>
            <br />
            <Link href="/taboo">
              <Button variant="light" className="font-bold" size="sm">
                TABOO
              </Button>
            </Link>
          </div>
        }
      >
        <Button variant="light" className="font-bold">
          GAMES & DISCUSSION CARDS
        </Button>
      </Tooltip> */}

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
