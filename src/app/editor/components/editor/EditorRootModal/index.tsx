import { FC, useEffect, useMemo, useRef } from "react";
import { TTemplate } from "../../create/ChooseTemplateModal/templates";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { mapTypeToTitle } from "../mappers";
import { ImageEx } from "../ImageEx";
import { TextDefaultEx } from "../TextDefault";
import { Text2ColEx } from "../Text2Col";
import { TextSticker } from "../TextSticker";
import { TextChecklist } from "../TextChecklist";
import { Video } from "../Video";
import { Audio } from "../Audio";
import { Note } from "../Note";
import { FillGapsSelect } from "../FillGapsSelect";
import { FillGapsInput } from "../FillGapsInput";
import { FillGapsDrag } from "../FillGapsDrag";
import { MatchWordWord } from "../MatchWordWord";
import { MatchWordImage } from "../MatchWordImage";
import { MatchWordColumn } from "../MatchWordColumn";
import { TestEx } from "../TestEx";
import { FreeInputFormEx } from "../FreeInputFormEx";
import { IntEx } from "../Int";
import { FillGapsNew } from "../FillGapsNew";
import { T } from "@/i18n/T";
import Image from "next/image";
import CloseIcon from "@/assets/icons/close.svg";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  type?: TTemplate["type"];
  onBack?: () => void;
  id?: number;
  onSuccess: (id: number) => void;
  chosenExToEdit?: {
    id?: number;
    type?: TTemplate["type"] | string;
    [key: string]: unknown;
  };
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

const blurActiveField = (root: HTMLElement | null) => {
  const active = document.activeElement as HTMLElement | null;
  if (!active || !root?.contains(active)) return;
  if (
    active.tagName === "INPUT" ||
    active.tagName === "TEXTAREA" ||
    active.isContentEditable
  ) {
    active.blur();
  }
};

export const EditorRootModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  type,
  onBack,
  onSuccess,
  chosenExToEdit,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const restoreStylesRef = useRef<null | (() => void)>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const touchRef = useRef<{ y: number; moved: boolean } | null>(null);

  // iOS Safari: prevent window scroll jumps when keyboard opens inside modal
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const unlock = () => {
      // Always ensure we don't leave the page locked.
      try {
        if (body.style.overflow === "hidden") body.style.overflow = "";
        if (html.style.overflow === "hidden") html.style.overflow = "";
        body.style.removeProperty("overflow");
        html.style.removeProperty("overflow");
      } catch {}

      try {
        const raw = body.dataset?.editorScrollLock;
        if (!raw) return;
        const prev = JSON.parse(raw || "{}");

        body.style.position = prev.bodyPosition ?? "";
        body.style.top = prev.bodyTop ?? "";
        body.style.left = prev.bodyLeft ?? "";
        body.style.right = prev.bodyRight ?? "";
        body.style.width = prev.bodyWidth ?? "";
        body.style.overflow = prev.bodyOverflow ?? "";
        html.style.overflow = prev.htmlOverflow ?? "";

        const y = Number(prev.scrollY || 0);
        window.scrollTo(0, y);
      } catch {
        // last resort: never leave page locked
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow = "";
        html.style.overflow = "";
        try {
          body.style.removeProperty("overflow");
          html.style.removeProperty("overflow");
        } catch {}
      } finally {
        try {
          delete body.dataset.editorScrollLock;
        } catch {}
      }
    };

    // if modal is closed programmatically, always unlock
    if (!isVisible) {
      unlock();
      restoreStylesRef.current = null;
      return;
    }

    // don't double-lock
    if (body.dataset?.editorScrollLock) {
      restoreStylesRef.current = unlock;
      return () => unlock();
    }

    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      scrollY: window.scrollY,
    };
    body.dataset.editorScrollLock = JSON.stringify(prev);

    body.style.position = "fixed";
    body.style.top = `-${prev.scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    restoreStylesRef.current = unlock;
    return () => {
      unlock();
      restoreStylesRef.current = null;
    };
  }, [isVisible]);

  const EditorComponent = useMemo(() => {
    const exType = type || chosenExToEdit?.type;
    switch (exType) {
      case "image":
        return ImageEx;
      case "text-default":
        return TextDefaultEx;
      case "text-2-col":
        return Text2ColEx;
      case "text-sticker":
        return TextSticker;
      case "text-checklist":
        return TextChecklist;
      case "video":
        return Video;
      case "audio":
        return Audio;
      case "note":
        return Note;
      case "fill-gaps-select":
        return FillGapsSelect;
      case "fill-gaps-input":
        return FillGapsInput;
      case "fill-gaps-drag":
        return FillGapsDrag;
      case "match-word-word":
        return MatchWordWord;
      case "match-word-image":
        return MatchWordImage;
      case "match-word-column":
        return MatchWordColumn;
      case "test":
        return TestEx;
      case "free-input-form":
        return FreeInputFormEx;
      case "int":
        return IntEx;
      case "FILL_GAPS_NEW":
        return FillGapsNew;
      default:
    }
  }, [type, chosenExToEdit]);

  const titleType = type || chosenExToEdit?.type;

  return (
    <Modal
      isDismissable={false}
      hideCloseButton
      size="5xl"
      isOpen={isVisible}
      onClose={() => {
        restoreStylesRef.current?.();
        setIsVisible(false);
      }}
      // Custom body lock above — avoid NextUI double-lock fighting iOS scroll.
      shouldBlockScroll={false}
      scrollBehavior="inside"
      placement="center"
      classNames={{
        wrapper: `${OVERLAY_ABOVE_HEADER_Z_CLASS} items-center max-sm:overflow-hidden`,
        // Desktop shell matches pre-adaptive; tighter flex lock only on mobile
        base: [
          "max-h-[92dvh] max-w-[1280px] w-[min(100%,1280px)] mx-auto my-2 sm:my-4",
          "max-sm:max-h-[min(92dvh,100dvh)] max-sm:!overflow-hidden max-sm:flex max-sm:flex-col",
        ].join(" "),
        body: "overflow-y-auto overscroll-contain max-sm:min-h-0 max-sm:flex-1",
      }}
      style={{ background: "#F9F9F9" }}
    >
      <ModalContent className="border-0 shadow-2xl max-sm:flex max-sm:max-h-[min(92dvh,100dvh)] max-sm:flex-col max-sm:overflow-hidden">
        <ModalHeader className="relative shrink-0 border-b border-default-200 px-4 py-4 pr-12 sm:px-6 sm:py-5">
          <button
            type="button"
            onClick={() => {
              restoreStylesRef.current?.();
              setIsVisible(false);
            }}
            className="absolute right-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/70 shadow-sm ring-1 ring-black/10 hover:bg-white/90"
            aria-label="Close"
          >
            <Image src={CloseIcon} alt="" width={16} height={16} />
          </button>
          <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 pr-2">
            <div className="flex min-w-0 items-center justify-start">
              {!chosenExToEdit?.id ? (
                <button
                  type="button"
                  onClick={() => onBack && onBack()}
                  className="shrink-0 whitespace-nowrap text-left text-small font-light"
                  style={{ cursor: "pointer" }}
                >
                  <T
                    k="editor.backToOtherTemplates"
                    defaultText="<- другие шаблоны"
                  />
                </button>
              ) : (
                <div className="h-9 w-9 shrink-0" aria-hidden />
              )}
            </div>
            <div className="min-w-0 px-1 text-center">
              <p className="break-words text-balance text-base font-semibold [overflow-wrap:anywhere] sm:text-lg">
                {mapTypeToTitle(titleType)}
              </p>
            </div>
            <div className="h-9 w-9 shrink-0" aria-hidden />
          </div>
        </ModalHeader>
        <ModalBody
          className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-8 sm:py-6 max-sm:min-h-0 max-sm:flex-1 [-webkit-overflow-scrolling:touch]"
          onScroll={(e) => {
            bodyRef.current = e.currentTarget;
            if (touchRef.current?.moved) {
              blurActiveField(e.currentTarget);
            }
          }}
          onTouchStart={(e) => {
            bodyRef.current = e.currentTarget;
            const t = e.touches[0];
            touchRef.current = { y: t?.clientY ?? 0, moved: false };
          }}
          onTouchMove={(e) => {
            const st = touchRef.current;
            if (!st) return;
            const y = e.touches[0]?.clientY ?? 0;
            if (Math.abs(y - st.y) > 8) {
              st.moved = true;
              blurActiveField(e.currentTarget);
            }
          }}
          onTouchEnd={() => {
            touchRef.current = null;
          }}
        >
          {!!EditorComponent && (
            <EditorComponent
              onSuccess={onSuccess}
              defaultValues={chosenExToEdit ? chosenExToEdit : undefined}
              lastSortIndex={lastSortIndex}
              currentSortIndexToShift={currentSortIndexToShift}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
