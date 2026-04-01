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

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  type?: TTemplate["type"];
  onBack?: () => void;
  id?: number;
  onSuccess: (id: number) => void;
  chosenExToEdit?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const EditorRootModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  type,
  id,
  onBack,
  onSuccess,
  chosenExToEdit,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const restoreStylesRef = useRef<null | (() => void)>(null);

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
          delete (body.dataset as any).editorScrollLock;
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

  return (
    <Modal
      isDismissable={false}
      size="5xl"
      isOpen={isVisible}
      onClose={() => {
        restoreStylesRef.current?.();
        setIsVisible(false);
      }}
      style={{ background: "#F9F9F9", overflow: "hidden" }}
      scrollBehavior="inside"
      placement="center"
      classNames={{ base: "max-h-[92dvh]" }}
    >
      <ModalContent>
        <ModalHeader className="justify-center">
          <div>{mapTypeToTitle(type)}</div>
          {!chosenExToEdit?.id && (
            <div
              onClick={() => onBack && onBack()}
              className="font-light absolute left-4 text-small top-5"
              style={{ cursor: "pointer" }}
            >
              {"<- другие шаблоны"}
            </div>
          )}
        </ModalHeader>
        <ModalBody className="overflow-y-auto">
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
