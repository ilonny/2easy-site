"use client";

import React, { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "@/auth";
import Image from "next/image";
import EditIcon from "@/assets/icons/edit_blue.svg";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import i18n from "./config";
import { apiUpdateTranslationKey } from "@/api/translations";
import { checkResponse } from "@/api";

type TProps = {
  k: string;
  values?: Record<string, any>;
  defaultText?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export function T({ k, values, defaultText, className, as }: TProps) {
  const { t } = useTranslation();
  const { profile } = useContext(AuthContext);
  const canEdit = Number(profile?.id) === 18;

  const Tag: any = as || "span";

  const rendered = useMemo(() => {
    const text = t(k, { ...values, defaultValue: defaultText ?? k });
    return text;
  }, [t, k, values, defaultText]);

  const [isOpen, setIsOpen] = useState(false);
  const [ru, setRu] = useState("");
  const [en, setEn] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const stopOuterHandlers = (e: any) => {
    // Prevent popovers/links/buttons under the portal from reacting.
    // IMPORTANT: do it in bubbling phase so inner controls still work.
    try {
      e?.stopPropagation?.();
    } catch {}
  };

  const open = () => {
    const currentRu = i18n.getResource("ru", "translation", k);
    const currentEn = i18n.getResource("en", "translation", k);
    setRu(typeof currentRu === "string" ? currentRu : "");
    setEn(typeof currentEn === "string" ? currentEn : "");
    setIsOpen(true);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const res = await apiUpdateTranslationKey({ key: k, ru, en });
      checkResponse(res);
      if (res?.success) {
        i18n.addResource("ru", "translation", k, ru);
        i18n.addResource("en", "translation", k, en);
        i18n.reloadResources(["ru", "en"], ["translation"]);
        setIsOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return <Tag className={className}>{rendered}</Tag>;

  if (!canEdit) {
    return <Tag className={className}>{rendered}</Tag>;
  }

  return (
    <>
      <span
        className={`inline-flex items-center gap-1 min-w-0 group ${className || ""}`}
      >
        <Tag className="min-w-0">{rendered}</Tag>
        <span
          role="button"
          tabIndex={0}
          onPointerDown={(e) => {
            // Important: prevent parent Link/Button handlers.
            e.preventDefault();
            e.stopPropagation();
            // @ts-ignore
            e.nativeEvent?.stopImmediatePropagation?.();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // @ts-ignore
            e.nativeEvent?.stopImmediatePropagation?.();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // @ts-ignore
            e.nativeEvent?.stopImmediatePropagation?.();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // @ts-ignore
            e.nativeEvent?.stopImmediatePropagation?.();
            open();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              // @ts-ignore
              e.nativeEvent?.stopImmediatePropagation?.();
              open();
            }
          }}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/95 p-0.5 shadow-sm ring-1 ring-black/15 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity dark:bg-zinc-900/90 dark:ring-white/20"
          aria-label={`Edit translation ${k}`}
        >
          <Image
            src={EditIcon}
            alt="edit"
            width={14}
            height={14}
            className="size-[14px]"
          />
        </span>
      </span>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <ModalContent>
          <div
            onPointerDown={stopOuterHandlers}
            onMouseDown={stopOuterHandlers}
            onTouchStart={stopOuterHandlers}
            onClick={stopOuterHandlers}
            onKeyDown={stopOuterHandlers}
          >
            <ModalHeader className="flex flex-col gap-1">
              Edit translation
            </ModalHeader>
            <ModalBody className="gap-4">
              <Input label="Key" value={k} isReadOnly />
              <Textarea
                label="Русский"
                minRows={3}
                value={ru}
                onValueChange={setRu}
              />
              <Textarea
                label="English"
                minRows={3}
                value={en}
                onValueChange={setEn}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={save} isLoading={isSaving}>
                Save
              </Button>
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
