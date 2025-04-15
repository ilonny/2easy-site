import {
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
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
  const [isSubViews, setIsSubViews] = useState(false);

  const [templatesToShow, setTemplatesToShow] = useState(templates);

  const onClickTemplate = useCallback(
    (t: TTemplate) => {
      if (t.subItems?.length) {
        setTemplatesToShow(t.subItems);
        setIsSubViews(true);
        return;
      }
      onChooseTemplate(t);
    },
    [onChooseTemplate]
  );

  const onBack = useCallback(() => {
    setTemplatesToShow(templates);
    setIsSubViews(false);
  }, []);

  return (
    <Modal
      size="4xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader className="justify-center">
          <p className="text-center">Выберите шаблон задания</p>
          {isSubViews && (
            <div
              onClick={onBack}
              className="font-light absolute left-4 text-small top-5"
              style={{ cursor: "pointer" }}
            >
              {"<- все шаблоны"}
            </div>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-wrap justify-start">
            {templatesToShow?.map((template) => {
              return (
                <Card
                  className="w-[50%] p-2"
                  shadow="none"
                  radius="none"
                  key={template.type}
                >
                  <div
                    onClick={() => {
                      onClickTemplate(template);
                    }}
                  >
                    <Card
                      shadow="none"
                      radius="sm"
                      className="p-5 flex items-center justify-center"
                      style={{
                        backgroundColor: "#2A2374",
                        cursor: "pointer",
                        height: "220px",
                        backgroundImage: template.bgImage
                          ? `url(${template.bgImage?.src})`
                          : "none",
                        backgroundSize: "cover",
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
