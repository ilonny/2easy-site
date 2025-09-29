"use client";

import { ContentWrapper } from "@/components";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { data } from "./data";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLessons } from "../lessons/hooks/useLessons";
import { useExList } from "../editor/hooks/useExList";
import { Zoom } from "react-toastify";
import { ExList } from "../editor/components/view/ExList";
import { BASE_URL } from "@/api";
import Dino from "@/assets/images/dino.gif";

export default function GrammarPage() {
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
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="h-10" />
        <div className="h-10" />
        <h1 style={{ fontWeight: "600", fontSize: 38, textAlign: "center" }}>
          Hi!
          <br />Я – туториал ✨
        </h1>
        <p className="text-center mt-6" style={{ fontSize: 18 }}>
          За 5 минут объясню, как создавать уроки, добавлять учеников и
          проводить
          <br />
          уроки в real-time
        </p>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex flex-wrap items-stretch">
          {data.map((block) => {
            return (
              <div
                key={block.id}
                className="w-[100%] h-[100%] lg:w-[33.3333%] lg:grayscale hover:grayscale-0"
                style={{ padding: 10, cursor: "pointer" }}
                onClick={() => onClickTotur(block.lesson_id)}
              >
                <div
                  className="w-[100%] h-[100%]  text-center lg:min-h-[470px]"
                  style={{ borderRadius: 10, background: "#fff" }}
                >
                  <div className="w-[100%] h-[300px] flex items-center justify-center">
                    <Image
                      src={block.img}
                      alt="img"
                      className="max-h-[100%] m-auto w-auto"
                    />
                  </div>
                  <div style={{ padding: 20, marginTop: 0 }}>
                    <p
                      style={{
                        textTransform: "uppercase",
                        fontWeight: "700",
                        fontSize: 22,
                        ...(block.titleStyle ? { ...block.titleStyle } : {}), // Spread outside
                      }}
                    >
                      {block.title}
                    </p>
                    <p style={{ marginTop: -12, padding: 20 }}>{block.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <Modal
          size="5xl"
          isOpen={isVisible}
          onClose={() => setIsVisible(false)}
          style={{ background: "#F9F9F9", overflow: "hidden" }}
          scrollBehavior="inside"
          isDismissable={false}
        >
          <ModalContent>
            <ModalBody className="py-6">
              {!lesson && !exList?.length ? (
                <div className="w-full h-[500px] flex justify-center items-center ">
                  <Image
                    src={Dino.src}
                    alt="dino animated"
                    width={150}
                    height={150}
                  />
                </div>
              ) : (
                <div className="w-[100%]">
                  <div
                    className="p-2 lg:p-10"
                    style={{
                      width: "100%",
                      maxWidth: 1160,
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      margin: "auto",
                    }}
                  >
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
                    {!!lesson?.description && (
                      <h2
                        style={{
                          fontSize: 20,
                          textAlign: "center",
                          // color: "#3f28c6",
                          fontWeight: 500,
                          maxWidth: 800,
                          margin: "auto",
                          whiteSpace: "break-spaces",
                        }}
                      >
                        {lesson?.description}
                      </h2>
                    )}
                    <div className="h-8"></div>
                    {!!lesson?.image_path && (
                      <img
                        src={BASE_URL + "/" + lesson.image_path}
                        style={{
                          maxHeight: 400,
                          margin: "auto",
                          marginBottom: 60,
                        }}
                        alt="image lesson"
                      />
                    )}
                    <div className="h-8"></div>
                    <div key={exList.length}>
                      <ExList
                        list={exList}
                        isView
                        key={exList.length}
                        is2easy={true}
                        isAdmin={false}
                        isPresentationMode={true}
                      />
                      <Button
                        variant="flat"
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          setIsVisible(false);
                        }}
                      >
                        Закрыть
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="h-10" />
            </ModalBody>
          </ModalContent>
        </Modal>
      </ContentWrapper>
    </main>
  );
}
