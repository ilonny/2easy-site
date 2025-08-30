import { FC, useMemo } from "react";
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
      default:
    }
  }, [type, chosenExToEdit]);

  return (
    <Modal
      size="5xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      style={{ background: "#F9F9F9", overflow: "hidden" }}
      scrollBehavior="outside"
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
        <ModalBody>
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
