import {
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
  const rootTemplates = useMemo(() => templates, []);

  const [isSubViews, setIsSubViews] = useState(false);

  const [templatesToShow, setTemplatesToShow] = useState(rootTemplates);

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
    setTemplatesToShow(rootTemplates);
    setIsSubViews(false);
  }, [rootTemplates]);

  useEffect(() => {
    if (isVisible) {
      setTemplatesToShow(rootTemplates);
      setIsSubViews(false);
    }
  }, [isVisible, rootTemplates]);

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
                  className="w-[100%] lg:w-[50%] p-2"
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
                      className="p-4 sm:p-5 flex items-center justify-center min-h-[150px] h-[min(38vh,200px)] sm:h-[200px] lg:h-[220px]"
                      style={{
                        backgroundColor: "#e3e3e3",
                        cursor: "pointer",
                        backgroundImage: template.bgImage
                          ? `url(${template.bgImage?.src})`
                          : "none",
                        backgroundSize: "cover",
                      }}
                    >
                      <p
                        className="font-bold text-white uppercase text-base sm:text-lg lg:text-[20px]"
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
