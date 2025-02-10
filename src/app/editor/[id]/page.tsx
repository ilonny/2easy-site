"use client";

import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs, Card } from "@nextui-org/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CreateExButton } from "../components/create/CreateExButton";
import { ChooseTemplateModal } from "../components/create/ChooseTemplateModal";
import { TTemplate } from "../components/create/ChooseTemplateModal/templates";
import { EditorRootModal } from "../components/editor/EditorRootModal";

export default function EditorPage() {
  const params = useParams();
  const { lesson, getLesson } = useLessons();
  const [exCreateTemplateModal, setExCreateTemplateModal] = useState(false);
  const [editorModal, setEditorModal] = useState(false);
  const [chosenTemplate, setChosenTemplate] = useState<TTemplate | null>(null);

  useEffect(() => {
    //@ts-ignore
    getLesson(params.id);
  }, [getLesson, params.id]);

  const onChooseTemplate = useCallback((template: TTemplate) => {
    setExCreateTemplateModal(false);
    setChosenTemplate(template);
    setEditorModal(true);
  }, []);

  const onPressCreate = useCallback(() => {
    setChosenTemplate(null);
    setExCreateTemplateModal(true);
  }, []);

  const onSuccessCreate = useCallback(() => {
    setChosenTemplate(null);
    setExCreateTemplateModal(false);
    setEditorModal(false);
  }, []);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem>{lesson?.title}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <Card radius="none" shadow="none" className="p-5">
          <CreateExButton onPress={onPressCreate} />
        </Card>
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
      <ChooseTemplateModal
        onChooseTemplate={onChooseTemplate}
        isVisible={exCreateTemplateModal}
        setIsVisible={setExCreateTemplateModal}
      />
      <EditorRootModal
        isVisible={editorModal}
        setIsVisible={setEditorModal}
        type={chosenTemplate?.type}
        onSuccess={onSuccessCreate}
        onBack={() => {
          setChosenTemplate(null);
          setEditorModal(false);
          setExCreateTemplateModal(true);
        }}
      />
    </main>
  );
}
