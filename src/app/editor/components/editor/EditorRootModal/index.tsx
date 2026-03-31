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
import { FillGapsNew } from "../FillGapsNew";
import { MatchWordWord } from "../MatchWordWord";
import { MatchWordImage } from "../MatchWordImage";
import { MatchWordColumn } from "../MatchWordColumn";
import { TestEx } from "../TestEx";
import { FreeInputFormEx } from "../FreeInputFormEx";
import { IntEx } from "../Int";

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
  const scrollYRef = useRef<number>(0);
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // @ts-ignore
    !(window as any)?.MSStream;

  useEffect(() => {
    if (!isVisible) return;
    if (!isIOS) return;

    // iOS Safari can "jump" the window scroll when focusing inputs inside fixed modals.
    // The most robust fix is to lock the document scroll while this modal is open.
    scrollYRef.current = window.scrollY || 0;

    const body = document.body;
    const html = document.documentElement;
    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: (html.style as any).overscrollBehavior,
    };

    html.style.overflow = "hidden";
    (html.style as any).overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      (html.style as any).overscrollBehavior = prev.htmlOverscrollBehavior;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;

      // Restore scroll position
      const y = scrollYRef.current || 0;
      window.scrollTo(0, y);
    };
  }, [isIOS, isVisible]);

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
      case "FILL_GAPS_NEW":
        return FillGapsNew;
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
      default:
    }
  }, [type, chosenExToEdit]);

  return (
    <Modal
      isDismissable={false}
      size="5xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      placement="center"
      style={{ background: "#F9F9F9", overflow: "hidden" }}
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[92dvh]",
      }}
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
