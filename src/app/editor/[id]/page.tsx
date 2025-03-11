"use client";

import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ContentWrapper } from "@/components";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateExButton } from "../components/create/CreateExButton";
import { ChooseTemplateModal } from "../components/create/ChooseTemplateModal";
import { TTemplate } from "../components/create/ChooseTemplateModal/templates";
import { EditorRootModal } from "../components/editor/EditorRootModal";
import { useExList } from "../hooks/useExList";
import { ExList } from "../components/view/ExList";

export default function EditorPage() {
  const params = useParams();
  const { lesson, getLesson } = useLessons();
  const { exList, getExList, exListIsLoading, changeSortIndex, deleteEx } =
    useExList(params.id);
  const [exCreateTemplateModal, setExCreateTemplateModal] = useState(false);
  const [editorModal, setEditorModal] = useState(false);
  const [chosenTemplate, setChosenTemplate] = useState<TTemplate | null>(null);
  const [chosenExToEdit, setChosenExToEdit] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>();

  useEffect(() => {
    //@ts-ignore
    getLesson(params.id);
    getExList();
  }, [getExList, getLesson, params.id]);

  const onChooseTemplate = useCallback((template: TTemplate) => {
    setExCreateTemplateModal(false);
    setChosenTemplate(template);
    setEditorModal(true);
  }, []);

  const onPressCreate = useCallback(() => {
    setChosenTemplate(null);
    setExCreateTemplateModal(true);
    setChosenExToEdit(null);
  }, []);

  const onSuccessCreate = useCallback(() => {
    setChosenTemplate(null);
    setExCreateTemplateModal(false);
    setEditorModal(false);
    getExList();
  }, [getExList]);

  const onPressEditEx = useCallback((ex) => {
    setChosenExToEdit({
      ...ex.data,
      id: ex.id,
      type: ex.type,
      sortIndex: ex.sortIndex,
    });
    setEditorModal(true);
  }, []);

  const onChangeSort = useCallback(
    async (exId: number, newIndex: number) => {
      await changeSortIndex(exId, newIndex);
      getExList();
    },
    [changeSortIndex, getExList]
  );

  const onPressDelete = useCallback((exId: number) => {
    setDeleteId(exId);
    setDeleteModal(true);
  }, []);

  const onChangeIsVisible = useCallback(() => {
    getExList();
  }, [getExList]);

  const lastSortIndex = useMemo(() => {
    return exList.length;
  }, [exList.length]);

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
        <div
          className="p-10"
          style={{
            width: 1160,
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: 10,
          }}
        >
          <ExList
            list={exList}
            onPressEdit={onPressEditEx}
            changeSortIndex={onChangeSort}
            onPressDelete={onPressDelete}
            onChangeIsVisible={onChangeIsVisible}
          />
          <div className="h-10" />
          <div className="h-10" />
          <Card radius="none" shadow="none">
            <CreateExButton onPress={onPressCreate} />
          </Card>
          <div className="h-10" />
          <div className="h-10" />
        </div>
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
        chosenExToEdit={chosenExToEdit}
        lastSortIndex={lastSortIndex}
        onBack={() => {
          setChosenTemplate(null);
          setEditorModal(false);
          setExCreateTemplateModal(true);
        }}
      />
      <Modal
        size="xl"
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        style={{ background: "#F9F9F9" }}
        className="p-12"
      >
        <ModalContent>
          <ModalHeader className="justify-center">
            <p style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}>
              Вы уверены, что хотите удалить
              <br />
              задание?
            </p>
          </ModalHeader>
          <ModalBody>
            <Button
              variant="light"
              color="danger"
              className="w-full"
              size="lg"
              onClick={async () => {
                setDeleteModal(false);
                await deleteEx(deleteId);
                getExList();
              }}
            >
              <p style={{ color: "#A42929" }}>Да, удалить</p>
            </Button>
            <Button
              color="primary"
              className="w-full"
              size="lg"
              onClick={() => setDeleteModal(false)}
            >
              Отмена
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
}
