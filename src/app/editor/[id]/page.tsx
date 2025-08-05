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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CreateExButton } from "../components/create/CreateExButton";
import { ChooseTemplateModal } from "../components/create/ChooseTemplateModal";
import { TTemplate } from "../components/create/ChooseTemplateModal/templates";
import { EditorRootModal } from "../components/editor/EditorRootModal";
import { useExList } from "../hooks/useExList";
import { ExList } from "../components/view/ExList";
import { BASE_URL } from "@/api";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { withLogin } from "@/auth/hooks/withLogin";
import { StartLessonButton } from "@/app/lessons/components/StartLessonButton";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { EditorContext } from "../context";
import { AuthContext } from "@/auth";

export default function EditorPage() {
  withLogin();
  const params = useParams();
  const { profile } = useContext(AuthContext);
  const { lesson, getLesson } = useLessons();
  const { exList, getExList, exListIsLoading, changeSortIndex, deleteEx } =
    useExList(params.id);
  const [exCreateTemplateModal, setExCreateTemplateModal] = useState(false);
  const [editorModal, setEditorModal] = useState(false);
  const [chosenTemplate, setChosenTemplate] = useState<TTemplate | null>(null);
  const [chosenExToEdit, setChosenExToEdit] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const [currentSortIndexToShift, setCurrentSortIndexToShift] = useState<
    number | undefined
  >();

  const { checkSubscription } = useCheckSubscription();

  const { scrollToExId, setScrollToExId } = useContext(EditorContext);
  const exListRef = useRef([]);

  useEffect(() => {
    if (!exListRef.current.length) {
      exListRef.current = exList;
      return;
    }

    if (exList?.length > exListRef?.current?.length) {
      const oldExIds = exListRef?.current?.map((ex) => ex.id);

      const newId = exList.find((ex) => !oldExIds.includes(ex.id))?.id;
      if (newId) {
        const el = document.getElementById(`ex-${newId}`);
        el?.scrollIntoView();
      }
    }
    exListRef.current = exList;
    // if (scrollToExId) {
    //   //
    //   const el = document.getElementById(`ex-${scrollToExId}`);
    //   el?.scrollIntoView();
    //   window.setTimeout(() => {
    //     setScrollToExId(undefined);
    //   }, 1000);
    // }
  }, [scrollToExId, exList, setScrollToExId]);

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

  const onPressCreate = useCallback(
    (sortIndexToShift?: number) => {
      if (checkSubscription()) {
        setCurrentSortIndexToShift(sortIndexToShift);
        setChosenTemplate(null);
        setExCreateTemplateModal(true);
        setChosenExToEdit(null);
      }
    },
    [checkSubscription]
  );

  const onSuccessCreate = useCallback(
    (ex_id: number) => {
      setChosenTemplate(null);
      setExCreateTemplateModal(false);
      setEditorModal(false);
      setScrollToExId(ex_id);
      getExList();
    },
    [getExList, setScrollToExId]
  );

  const onPressEditEx = useCallback(
    (ex) => {
      if (checkSubscription()) {
        setChosenTemplate(null);
        setChosenExToEdit({
          ...ex.data,
          id: ex.id,
          type: ex.type,
          sortIndex: ex.sortIndex,
        });
        window.location.hash = `ex-${ex.id}`;
        setEditorModal(true);
      }
    },
    [checkSubscription]
  );

  const onChangeSort = useCallback(
    async (exId: number, newIndex: number) => {
      if (checkSubscription()) {
        await changeSortIndex(exId, newIndex);
        getExList();
      }
    },
    [changeSortIndex, getExList, checkSubscription]
  );

  const onPressDelete = useCallback(
    (exId: number) => {
      if (checkSubscription()) {
        setDeleteId(exId);
        setDeleteModal(true);
      }
    },
    [checkSubscription]
  );

  const onChangeIsVisible = useCallback(() => {
    if (checkSubscription()) {
      getExList();
    }
  }, [getExList, checkSubscription]);

  const lastSortIndex = useMemo(() => {
    return exList.length;
  }, [exList.length]);

  const is2easy = lesson?.user_id === 1;
  const isAdmin = profile?.role_id === 1;

  const showCreateExBtn = useMemo(() => {
    if (is2easy) {
      return isAdmin;
    }
    return true;
  }, [is2easy, isAdmin]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/profile?lessons">Мои уроки</BreadcrumbItem>
            <BreadcrumbItem>{lesson?.title}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div
          className="p-2 w-[100%] lg:p-10 lg:max-w-[1160px]"
          style={{
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: 10,
          }}
        >
          <StartLessonButton lesson={lesson} />
          <div className="w-[100%] lg:pl-[90px]">
            <h1
              style={{
                fontSize: 44,
                textAlign: "center",
                color: "#3f28c6",
                fontWeight: 700,
              }}
            >
              {lesson?.title}
            </h1>
          </div>
          {!!lesson?.description && (
            <h2
              style={{
                fontSize: 20,
                textAlign: "center",
                // color: "#3f28c6",
                fontWeight: 500,
                maxWidth: 800,
                margin: "auto",
              }}
            >
              {lesson?.description}
            </h2>
          )}
          <div className="h-8"></div>
          {!!lesson?.image_path && (
            <Zoom>
              <img
                src={BASE_URL + "/" + lesson.image_path}
                style={{ maxHeight: 400, margin: "auto", marginBottom: 60 }}
              />
            </Zoom>
          )}
          <div className="h-8"></div>
          <ExList
            list={exList}
            onPressEdit={onPressEditEx}
            changeSortIndex={onChangeSort}
            onPressDelete={onPressDelete}
            onChangeIsVisible={onChangeIsVisible}
            onPressCreate={onPressCreate}
            onSuccessCreate={onSuccessCreate}
            is2easy={is2easy}
            isAdmin={isAdmin}
          />
          <div className="h-10" />
          <div className="h-10" />
          {showCreateExBtn && (
            <>
              <Card radius="none" shadow="none">
                <CreateExButton
                  onPress={() => onPressCreate(null)}
                  onSuccessCreate={onSuccessCreate}
                  lesson_id={params.id}
                  currentSortIndexToShift={
                    exList[exList.length - 1]?.sortIndex || 0
                  }
                />
              </Card>
              <div className="h-10" />
              <div className="h-10" />
            </>
          )}
        </div>
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
        chosenExToEdit={chosenExToEdit}
        lastSortIndex={lastSortIndex}
        currentSortIndexToShift={currentSortIndexToShift}
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
