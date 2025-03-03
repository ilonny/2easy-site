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

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  type?: TTemplate["type"];
  onBack?: () => void;
  id?: number;
  onSuccess: () => void;
  chosenExToEdit?: any;
  lastSortIndex: number;
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
      default:
    }
  }, [type, chosenExToEdit]);

  return (
    <Modal
      size="4xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      style={{ background: "#F9F9F9" }}
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
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
