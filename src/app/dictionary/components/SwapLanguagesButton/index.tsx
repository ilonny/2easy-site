"use client";

import { Button } from "@nextui-org/react";
import i18n from "@/i18n/config";
import { FC } from "react";
import { DICTIONARY_TOUCH_BUTTON_CLASS } from "../../constants";

type TProps = {
  onSwap: () => void;
  isDisabled?: boolean;
};

export const SwapLanguagesButton: FC<TProps> = ({
  onSwap,
  isDisabled = false,
}) => {
  const label = i18n.t("dictionary.swapLanguages");

  return (
    <Button
      isIconOnly
      variant="light"
      size="md"
      className={`${DICTIONARY_TOUCH_BUTTON_CLASS} self-center sm:self-end h-12 w-12 min-w-12 shrink-0`}
      onClick={onSwap}
      isDisabled={isDisabled}
      aria-label={label}
      title={label}
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="text-[#767676] rotate-90 sm:rotate-0"
      >
        <path
          d="M7 8h11m0 0-3-3m3 3-3 3M17 16H6m0 0 3-3m-3 3 3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );
};
