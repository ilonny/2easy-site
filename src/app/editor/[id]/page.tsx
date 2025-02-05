"use client";

import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs, Card } from "@nextui-org/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CreateExButton } from "../components/create/CreateExButton";
import { ChooseTemplateModal } from "../components/create/ChooseTemplateModal";
import { TTemplate } from "../components/create/ChooseTemplateModal/templates";

export default function EditorPage() {
  const params = useParams();
  const { lesson, getLesson } = useLessons();
  const [exCreateTemplateModal, setExCreateTemplateModal] = useState(false);
  const [chosenTemplate, setChosenTemplate] = useState<TTemplate | null>(null);

  useEffect(() => {
    //@ts-ignore
    getLesson(params.id);
  }, [getLesson, params.id]);

  const onChooseTemplate = useCallback((template: TTemplate) => {
    console.log("click?");
    setExCreateTemplateModal(false);
    setChosenTemplate(template);
  }, []);

  const onPressCreate = useCallback(() => {
    setChosenTemplate(null);
    setExCreateTemplateModal(true);
  }, []);

  console.log("chosenTemplate", chosenTemplate);

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
    </main>
  );
}
