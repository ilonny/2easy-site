"use client";

import { FC, ReactNode, useMemo } from "react";
import { Autocomplete, AutocompleteItem, Spinner } from "@nextui-org/react";
import { TLanguage } from "../../types";
import { DICTIONARY_FIELD_LABEL_CLASS } from "../../constants";

type TProps = {
  label: ReactNode;
  languages: TLanguage[];
  selectedCode: string;
  onSelect: (code: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
};

const getLanguageLabel = (language: TLanguage) =>
  language.nativeName || language.name || language.code;

export const LanguageSelect: FC<TProps> = ({
  label,
  languages,
  selectedCode,
  onSelect,
  isLoading = false,
  isDisabled = false,
}) => {
  const hasSelectedItem = useMemo(
    () => languages.some((language) => language.code === selectedCode),
    [languages, selectedCode]
  );

  return (
    <Autocomplete
      // Remount when async items arrive so selectedKey paints the label.
      key={hasSelectedItem ? selectedCode : `pending-${selectedCode || "none"}`}
      label={label}
      labelPlacement="outside"
      selectedKey={hasSelectedItem ? selectedCode : null}
      onSelectionChange={(key) => {
        if (typeof key === "string" && key) {
          onSelect(key);
        }
      }}
      items={languages}
      isLoading={isLoading}
      isDisabled={isDisabled}
      allowsCustomValue={false}
      menuTrigger="focus"
      size="md"
      classNames={{
        base: "w-full min-w-0",
        listboxWrapper: "max-h-60",
      }}
      inputProps={{
        classNames: {
          label: DICTIONARY_FIELD_LABEL_CLASS,
          inputWrapper: "bg-white min-h-12 h-12",
          input: "text-base",
        },
      }}
      listboxProps={{
        emptyContent: isLoading ? <Spinner size="sm" /> : undefined,
      }}
    >
      {(language) => (
        <AutocompleteItem
          key={language.code}
          textValue={getLanguageLabel(language)}
        >
          <div className="flex flex-col">
            <span className="text-base text-[#231F20]">
              {getLanguageLabel(language)}
            </span>
            <span className="text-xs text-[#767676] uppercase">
              {language.code}
            </span>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
