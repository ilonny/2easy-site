"use client";

import { CatalogPageShell } from "@/components";
import {
  catalogGridClassName,
  GameCard,
} from "@/components/MainContent/GameCard";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
} from "@nextui-org/react";
import { data } from "./data";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLessons } from "../lessons/hooks/useLessons";
import { useExList } from "../editor/hooks/useExList";
import { ExList } from "../editor/components/view/ExList";
import Dino from "@/assets/images/dino.gif";
import { getImageUrl } from "../editor/helpers";
import { T } from "@/i18n/T";

export default function TutorialPage() {
  const [activeLessonId, setActiveLessonId] = useState<number | undefined>();
  const [isVisible, setIsVisible] = useState(false);

  const onClickTotur = useCallback((id: number) => {
    setActiveLessonId(id);
    setIsVisible(true);
  }, []);

  const { lesson, getLesson, setLesson } = useLessons();
  const { exList, getExList } = useExList(undefined, true);

  useEffect(() => {
    setLesson(undefined);
    if (activeLessonId) {
      getLesson(activeLessonId.toString());
      getExList(activeLessonId);
    }
  }, [activeLessonId, getExList, getLesson, setLesson]);

  return (
    <CatalogPageShell
      title={
        <>
          <T k="tutorial.hero.titleLine1" />
          <br />
          <T k="tutorial.hero.titleLine2" />
        </>
      }
      subtitle={
        <>
          <T k="tutorial.hero.subtitleLine1" />
          <br />
          <T k="tutorial.hero.subtitleLine2" />
        </>
      }
    >
      <div className={catalogGridClassName}>
        {data.map((block) => (
          <GameCard
            key={block.id}
            card={{
              titleKey: (block as { titleKey: string }).titleKey,
              descriptionKey: (block as { descKey: string }).descKey,
              image: block.img,
            }}
            onClick={() => onClickTotur(block.lesson_id)}
          />
        ))}
      </div>
      <Modal
        size="5xl"
        isOpen={isVisible}
        onClose={() => setIsVisible(false)}
        style={{ background: "#fff", overflow: "hidden" }}
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          <ModalBody className="py-6">
            {!lesson && !exList?.length ? (
              <div className="flex h-[500px] w-full items-center justify-center">
                <Image
                  src={Dino.src}
                  alt="dino animated"
                  width={150}
                  height={150}
                />
              </div>
            ) : (
              <div className="w-full">
                <div className="mx-auto w-full max-w-[1160px] rounded-[20px] bg-white p-2 lg:rounded-[30px] lg:p-10">
                  <h1 className="text-center text-[25px] font-bold tracking-brand text-primary lg:text-[40px]">
                    {lesson?.title}
                  </h1>
                  {!!lesson?.description && (
                    <h2 className="mx-auto mt-3 max-w-[800px] whitespace-pre-wrap text-center text-base font-bold tracking-brand text-brand-grayFont lg:text-xl">
                      {lesson?.description}
                    </h2>
                  )}
                  <div className="h-8" />
                  {!!lesson?.image_path && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(lesson.image_path)}
                      className="mx-auto mb-[60px] max-h-[400px]"
                      alt="image lesson"
                    />
                  )}
                  <div className="h-8" />
                  <div key={exList.length}>
                    <ExList
                      list={exList}
                      isView
                      key={exList.length}
                      is2easy={true}
                      isAdmin={false}
                      isPresentationMode={true}
                      onPressCreate={() => {}}
                      onSuccessCreate={() => {}}
                      onPressDelete={() => {}}
                      onPressEdit={() => {}}
                      changeSortIndex={async () => {}}
                      onChangeIsVisible={() => {}}
                    />
                    <Button
                      variant="flat"
                      className="mt-4 w-full rounded-[14px] bg-brand-gray text-sm font-bold tracking-brand text-brand-black"
                      size="lg"
                      onClick={() => {
                        setIsVisible(false);
                      }}
                    >
                      <T k="common.close" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </CatalogPageShell>
  );
}
