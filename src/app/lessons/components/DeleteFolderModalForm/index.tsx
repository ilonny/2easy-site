"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { T } from "@/i18n/T";
import { TCatalogFolder } from "../../hooks/useCatalog";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  folder: TCatalogFolder | null;
  onCheck: (id: number) => Promise<{
    success?: boolean;
    empty?: boolean;
    counts?: { lessons?: number; courses?: number };
  } | void>;
  onDelete: (id: number, force: boolean) => Promise<{
    success?: boolean;
    counts?: { lessons?: number; courses?: number };
  } | void>;
  onSuccess: () => void;
};

export const DeleteFolderModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  folder,
  onCheck,
  onDelete,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [counts, setCounts] = useState<{
    lessons: number;
    courses: number;
  } | null>(null);
  /** emptyConfirm | notEmpty | forceConfirm */
  const [step, setStep] = useState<
    "loading" | "emptyConfirm" | "notEmpty" | "forceConfirm"
  >("loading");

  const reset = useCallback(() => {
    setCounts(null);
    setStep("loading");
    setIsLoading(false);
    setIsChecking(false);
  }, []);

  const close = useCallback(() => {
    reset();
    setIsVisible(false);
  }, [reset, setIsVisible]);

  useEffect(() => {
    if (!isVisible || !folder?.id) {
      reset();
      return;
    }
    let cancelled = false;
    setStep("loading");
    setCounts(null);
    setIsChecking(true);
    void (async () => {
      try {
        const data = await onCheck(folder.id);
        if (cancelled) return;
        const lessons = Number(data?.counts?.lessons) || 0;
        const courses = Number(data?.counts?.courses) || 0;
        setCounts({ lessons, courses });
        if (data?.empty || (lessons === 0 && courses === 0)) {
          setStep("emptyConfirm");
        } else {
          setStep("notEmpty");
        }
      } catch {
        if (!cancelled) setStep("emptyConfirm");
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isVisible, folder?.id, onCheck, reset]);

  const tryDelete = useCallback(
    async (force: boolean) => {
      if (!folder?.id) return;
      setIsLoading(true);
      try {
        const data = await onDelete(folder.id, force);
        if (data && !data.success && data.counts) {
          setCounts({
            lessons: Number(data.counts.lessons) || 0,
            courses: Number(data.counts.courses) || 0,
          });
          setStep("notEmpty");
          return;
        }
        if (data?.success !== false) {
          onSuccess();
          close();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [close, folder?.id, onDelete, onSuccess],
  );

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={close}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        wrapper: "site-overlay-layer items-center p-2 sm:p-4",
        backdrop: "site-overlay-layer",
        base: "mx-0 my-auto max-h-[min(90dvh,720px)] w-full max-w-[calc(100vw-1rem)] rounded-[20px] bg-white sm:max-w-xl lg:rounded-[30px]",
        header: "shrink-0 border-b border-black/5 font-medium text-brand-black",
        body: "overflow-y-auto overscroll-contain",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <p>
            <T k="lessons.deleteFolderTitle" />
            {folder?.title ? ` «${folder.title}»` : ""}
          </p>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4 pb-5">
          {step === "loading" || isChecking ? (
            <p className="text-sm text-brand-black/60">…</p>
          ) : step === "forceConfirm" ? (
            <p className="text-sm leading-relaxed text-brand-black/80">
              <T k="lessons.deleteFolderForceConfirm" />
            </p>
          ) : step === "notEmpty" && counts ? (
            <p className="text-sm leading-relaxed text-brand-black/80">
              <T
                k="lessons.deleteFolderNotEmpty"
                values={{ lessons: counts.lessons, courses: counts.courses }}
              />
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-brand-black/80">
              <T k="lessons.deleteFolderEmptyConfirm" />
            </p>
          )}

          {step !== "loading" && !isChecking && (
            <div className="mt-auto flex w-full flex-col gap-2 pt-2">
              {step === "forceConfirm" ? (
                <>
                  <Button
                    isLoading={isLoading}
                    className="w-full rounded-[14px] bg-danger text-white"
                    onClick={() => tryDelete(true)}
                  >
                    <T k="lessons.deleteFolderForceContinue" />
                  </Button>
                  <Button
                    className="w-full rounded-[14px] bg-brand-violet text-white"
                    onClick={() => setStep("notEmpty")}
                  >
                    <T k="common.cancel" />
                  </Button>
                </>
              ) : step === "notEmpty" ? (
                <>
                  <Button
                    className="w-full rounded-[14px] bg-brand-violet text-white"
                    onClick={close}
                  >
                    <T k="common.cancel" />
                  </Button>
                  <Button
                    variant="light"
                    className="w-full rounded-[14px] text-sm font-medium text-danger"
                    onClick={() => setStep("forceConfirm")}
                  >
                    <T k="lessons.deleteFolderContinue" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full rounded-[14px] bg-brand-violet text-white"
                    onClick={close}
                    isDisabled={isLoading}
                  >
                    <T k="common.cancel" />
                  </Button>
                  <Button
                    variant="light"
                    className="w-full rounded-[14px] text-sm font-medium text-danger"
                    isLoading={isLoading}
                    onClick={() => tryDelete(false)}
                  >
                    <T k="common.delete" />
                  </Button>
                </>
              )}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
