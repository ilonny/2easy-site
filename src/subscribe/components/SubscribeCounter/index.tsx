"use client";
// import { Button } from "@/ui/Button";
import {
  Button,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useState } from "react";

export const SubscribeCounter = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-row">
      <Popover
        placement="bottom-end"
        color={"default"}
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        classNames={{ content: "px-3 py-3" }}
        backdrop="opaque"
      >
        <PopoverTrigger>
          <Button radius="sm" color="primary">
            3 days
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="mb-1">Пробный период до 18.10.2024</p>
          <Link href="/" color="primary" className="underline" size="sm">
            Выбрать тариф
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  );
};
