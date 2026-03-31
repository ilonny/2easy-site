import {
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { templates, TTemplate } from "./templates";
import { AuthContext } from "@/auth/context";

type TProps = {
  isVisible: boolean;
  setIsVisible: (arg: boolean) => void;
  onChooseTemplate: (t: TTemplate) => void;
};

const FILL_GAPS_NEW_ALLOWED_IDS = new Set([15, 18]);

function canSeeFillGapsNewTemplate(profileId: number | undefined): boolean {
  if (profileId === undefined || profileId === null) {
    return false;
  }
  return FILL_GAPS_NEW_ALLOWED_IDS.has(Number(profileId));
}

export const ChooseTemplateModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onChooseTemplate,
}) => {
  const { profile } = useContext(AuthContext);

  const rootTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (t.type === "FILL_GAPS_NEW") {
        return canSeeFillGapsNewTemplate(profile?.id);
      }
      return true;
    });
  }, [profile?.id]);

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
                      className="p-5 flex items-center justify-center"
                      style={{
                        backgroundColor: "#e3e3e3",
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
