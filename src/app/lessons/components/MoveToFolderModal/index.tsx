"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useState } from "react";
import { T } from "@/i18n/T";
import { TCatalogFolder } from "../../hooks/useCatalog";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  folders: TCatalogFolder[];
  currentFolderId?: number | null;
  onPick: (folderId: number | null) => Promise<void> | void;
};

export const MoveToFolderModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  folders,
  currentFolderId,
  onPick,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const pick = async (folderId: number | null) => {
    setIsLoading(true);
    try {
      await onPick(folderId);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      size="md"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        wrapper: "site-overlay-layer items-center p-2 sm:p-4",
        backdrop: "site-overlay-layer",
        base: "mx-0 my-auto max-h-[min(90dvh,720px)] w-full max-w-[calc(100vw-1rem)] rounded-[20px] bg-white sm:max-w-md lg:rounded-[30px]",
        header: "shrink-0 border-b border-black/5 font-medium text-brand-black",
        body: "overflow-y-auto overscroll-contain",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <T k="lessons.moveToFolder" />
        </ModalHeader>
        <ModalBody className="flex flex-col gap-2 pb-5">
          <Button
            variant="flat"
            className="justify-start rounded-[14px]"
            isLoading={isLoading}
            isDisabled={currentFolderId == null}
            onClick={() => pick(null)}
          >
            <T k="lessons.noFolder" />
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="flat"
              className="justify-start rounded-[14px]"
              isLoading={isLoading}
              isDisabled={Number(currentFolderId) === Number(folder.id)}
              onClick={() => pick(folder.id)}
            >
              <span className="mr-2">📁</span>
              {folder.title}
            </Button>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
