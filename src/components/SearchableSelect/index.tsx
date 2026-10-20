"use client";

import { FC, ReactNode, useMemo } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

export type SearchableSelectItem = {
  id: string;
  label: string;
  description?: string;
};

type TProps = {
  label?: ReactNode;
  placeholder?: string;
  items: SearchableSelectItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isDisabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Allow clearing selection (shows empty state) */
  allowsEmpty?: boolean;
  emptyLabel?: string;
};

export const SearchableSelect: FC<TProps> = ({
  label,
  placeholder,
  items,
  selectedId,
  onSelect,
  isDisabled,
  className,
  size = "md",
  allowsEmpty,
  emptyLabel,
}) => {
  const list = useMemo(() => {
    if (!allowsEmpty) return items;
    return [
      { id: "", label: emptyLabel || "—" },
      ...items,
    ];
  }, [allowsEmpty, emptyLabel, items]);

  const selectedKey =
    selectedId != null && list.some((i) => i.id === selectedId)
      ? selectedId
      : allowsEmpty
        ? ""
        : null;

  return (
    <Autocomplete
      key={`sel-${selectedKey ?? "none"}-${list.length}`}
      label={label}
      placeholder={placeholder}
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        if (key == null) {
          if (allowsEmpty) onSelect(null);
          return;
        }
        const id = String(key);
        onSelect(id === "" ? null : id);
      }}
      defaultItems={list}
      isDisabled={isDisabled}
      allowsCustomValue={false}
      menuTrigger="focus"
      size={size}
      className={className}
      classNames={{
        base: "w-full min-w-0",
        listboxWrapper: "max-h-72",
      }}
      inputProps={{
        classNames: {
          inputWrapper: "bg-white",
        },
      }}
    >
      {(item) => (
        <AutocompleteItem key={item.id} textValue={item.label}>
          <div className="flex flex-col">
            <span className="text-sm text-[#1d1d1f]">{item.label}</span>
            {item.description ? (
              <span className="text-xs text-[#86868b]">{item.description}</span>
            ) : null}
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
