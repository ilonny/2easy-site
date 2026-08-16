import {
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import CloseIcon from "@/assets/icons/close.svg";
import { templates, TTemplate } from "./templates";
import { T } from "@/i18n/T";

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
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="relative px-4 pr-12 py-3 sm:py-4">
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="absolute right-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/70 shadow-sm ring-1 ring-black/10 hover:bg-white/90"
            aria-label="Close"
          >
            <Image src={CloseIcon} alt="" width={16} height={16} />
          </button>
          {isSubViews ? (
            <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1">
              <div className="flex min-w-0 items-center justify-start self-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="shrink-0 text-left text-small font-light whitespace-nowrap"
                  style={{ cursor: "pointer" }}
                >
                  <T k="editor.backToAllTemplates" defaultText="<- все шаблоны" />
                </button>
              </div>
              <div className="min-w-0 self-center px-1 text-center text-base leading-snug sm:text-lg">
                <p className="break-words text-balance [overflow-wrap:anywhere]">
                  <T k="editor.chooseTemplateTitle" defaultText="Выберите шаблон задания" />
                </p>
              </div>
              <div className="flex shrink-0 justify-end self-center" aria-hidden>
                <div className="h-9 w-9" />
              </div>
            </div>
          ) : (
            <div className="min-w-0 pr-10 text-center text-base leading-snug sm:text-lg">
              <p className="break-words text-balance [overflow-wrap:anywhere]">
                <T k="editor.chooseTemplateTitle" defaultText="Выберите шаблон задания" />
              </p>
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
                        <T k={template.titleKey} defaultText={template.titleDefault} />
                      </p>
                      {!!template.descriptionKey && (
                        <p className="text-white text-center max-w-[300px]">
                          <T
                            k={template.descriptionKey}
                            defaultText={template.descriptionDefault}
                          />
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
