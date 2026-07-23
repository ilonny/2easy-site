"use client";

import { ExList } from "@/app/editor/components/view/ExList";
import { ChooseTemplateModal } from "@/app/editor/components/create/ChooseTemplateModal";
import { TTemplate } from "@/app/editor/components/create/ChooseTemplateModal/templates";
import { CreateExButton } from "@/app/editor/components/create/CreateExButton";
import { EditorRootModal } from "@/app/editor/components/editor/EditorRootModal";
import { useExList } from "@/app/editor/hooks/useExList";
import { EditorContext } from "@/app/editor/context";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { Button, Card, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TProps = {
  lessonId: number;
  title?: string;
  description?: string;
  tags?: string;
  onReloadMeta?: () => void;
};

export const AiLessonConstructorPreview: FC<TProps> = ({
  lessonId,
  title,
  description,
  tags,
  onReloadMeta,
}) => {
  const { setLessonIdOverride, setScrollToExId } = useContext(EditorContext);
  const { exList, getExList, changeSortIndex, deleteEx } = useExList(lessonId);
  const { checkSubscription } = useCheckSubscription();

  const [exCreateTemplateModal, setExCreateTemplateModal] = useState(false);
  const [editorModal, setEditorModal] = useState(false);
  const [chosenTemplate, setChosenTemplate] = useState<TTemplate | null>(null);
  const [chosenExToEdit, setChosenExToEdit] = useState<any>(null);
  const [currentSortIndexToShift, setCurrentSortIndexToShift] = useState<
    number | undefined
  >();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>();

  useEffect(() => {
    setLessonIdOverride(lessonId);
    getExList(lessonId);
    return () => {
      setLessonIdOverride(null);
    };
  }, [lessonId, getExList, setLessonIdOverride]);

  const reload = useCallback(() => {
    getExList(lessonId);
    onReloadMeta?.();
  }, [getExList, lessonId, onReloadMeta]);

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
    [checkSubscription],
  );

  const onSuccessCreate = useCallback(
    (ex_id: number) => {
      setChosenTemplate(null);
      setExCreateTemplateModal(false);
      setEditorModal(false);
      setScrollToExId(ex_id);
      getExList(lessonId);
    },
    [getExList, lessonId, setScrollToExId],
  );

  const onPressEditEx = useCallback(
    (ex: any) => {
      if (checkSubscription()) {
        setChosenTemplate(null);
        setChosenExToEdit({
          ...ex.data,
          id: ex.id,
          type: ex.type,
          sortIndex: ex.sortIndex,
        });
        setEditorModal(true);
      }
    },
    [checkSubscription],
  );

  const onChangeSort = useCallback(
    async (exId: number, newIndex: number) => {
      if (checkSubscription()) {
        await changeSortIndex(exId, newIndex);
        getExList(lessonId);
      }
    },
    [changeSortIndex, getExList, lessonId, checkSubscription],
  );

  const onPressDelete = useCallback(
    (exId: number) => {
      if (checkSubscription()) {
        setDeleteId(exId);
        setDeleteModal(true);
      }
    },
    [checkSubscription],
  );

  const lastSortIndex = useMemo(() => exList.length, [exList.length]);

  return (
    <div className="flex flex-col gap-4 min-h-0 h-full">
      <div className="rounded-xl bg-default-50 px-4 py-3 shrink-0">
        <h3 className="text-xl font-semibold">{title}</h3>
        {!!tags && <p className="text-sm text-primary mt-0.5">{tags}</p>}
        {!!description && (
          <p className="text-sm text-default-600 mt-1 whitespace-pre-wrap">
            {description}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
        <ExList
          list={exList}
          onPressEdit={onPressEditEx}
          changeSortIndex={onChangeSort}
          onPressDelete={onPressDelete}
          onChangeIsVisible={reload}
          onPressCreate={onPressCreate}
          onSuccessCreate={onSuccessCreate}
          activeStudentId={0}
        />
        <div className="h-4" />
        <Card radius="none" shadow="none">
          <CreateExButton
            onPress={() => onPressCreate(undefined)}
            onSuccessCreate={onSuccessCreate}
            lesson_id={String(lessonId)}
            currentSortIndexToShift={
              exList[exList.length - 1]?.sortIndex || 0
            }
          />
        </Card>
        <div className="h-8" />
      </div>

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
              <T k="editor.confirmDeleteEx" />
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
                getExList(lessonId);
              }}
            >
              <p style={{ color: "#A42929" }}>
                <T k="editor.confirmDelete" />
              </p>
            </Button>
            <Button
              color="primary"
              className="w-full"
              size="lg"
              onClick={() => setDeleteModal(false)}
            >
              <T k="common.cancel" defaultText={i18n.t("common.cancel")} />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
