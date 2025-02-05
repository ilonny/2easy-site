import {
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC } from "react";
import { templates, TTemplate } from "./templates";

type TProps = {
  isVisible: boolean;
  setIsVisible: (arg: boolean) => void;
  onChooseTemplate: (t: TTemplate) => void;
};

export const ChooseTemplateModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onChooseTemplate,
}) => {
  return (
    <Modal size="4xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <>Выберите шаблон задания</>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-wrap">
            {templates?.map((template) => {
              return (
                <Card
                  className="w-[50%] p-2"
                  shadow="none"
                  radius="none"
                  key={template.type}
                >
                  <div
                    onClick={() => {
                      onChooseTemplate(template);
                    }}
                  >
                    <Card
                      shadow="none"
                      radius="sm"
                      className="p-5 flex items-center justify-center"
                      style={{
                        background: "#D9D9D9",
                        cursor: "pointer",
                        height: "220px",
                      }}
                    >
                      <p
                        className="font-bold text-white uppercase"
                        style={{ fontSize: 20 }}
                      >
                        {template.title}
                      </p>
                      {!!template.description && (
                        <p className="text-white text-center max-w-[300px]">
                          {template.description}
                        </p>
                      )}
                    </Card>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="h-4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
