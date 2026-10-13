"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from "@/app/editor/helpers";
import { ImageUpload } from "@/components/ImageUpload";
import { Button, Input } from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TrueFalseExView } from "../../view/TrueFalseExView";
import { useExData } from "../hooks/useExData";
import { useUploadTrueFalseEx } from "../hooks/useUploadTrueFalseEx";
import { TitleExInput } from "../TitleExInput";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import {
  isTrueFalseSentenceValid,
  TTrueFalseData,
  TTrueFalseSentence,
} from "./types";
import styles from "./styles.module.css";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { toast } from "react-toastify";
import Close from "@/assets/icons/close.svg";

function makeSentence(text = "", answer: boolean = true): TTrueFalseSentence {
  return {
    id: uuidv4(),
    text,
    answer,
  };
}

const defaultValuesStub: TTrueFalseData = {
  title: "Let's practice!",
  titleColor: "#3F28C6",
  subtitle: "True or False?",
  description: "",
  images: [],
  sentences: [makeSentence()],
};

type TProps = {
  onSuccess: (id: number) => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const TrueFalse: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveTrueFalseEx, success } = useUploadTrueFalseEx(
    lastSortIndex,
    currentSortIndexToShift,
  );

  const initialData = useMemo(() => {
    if (defaultValues) {
      const sentences = Array.isArray(defaultValues.sentences)
        ? defaultValues.sentences.map((s: any) => ({
            id: s?.id || uuidv4(),
            text: String(s?.text || ""),
            answer: typeof s?.answer === "boolean" ? s.answer : true,
          }))
        : [makeSentence()];
      return {
        ...defaultValuesStub,
        ...defaultValues,
        sentences: sentences.length ? sentences : [makeSentence()],
      } as TTrueFalseData;
    }
    return defaultValuesStub;
  }, [defaultValues]);

  const { data, changeData } = useExData<TTrueFalseData>(initialData);

  const [images, setImages] = useState<TTrueFalseData["images"]>(
    defaultValues?.images || [],
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    changeData("images", images || []);
  }, [changeData, images]);

  useEffect(() => {
    if (!success) return;
    onSuccess?.((data as any)?.id || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to success
  }, [success, onSuccess]);

  const updateSentence = useCallback(
    (sentenceId: string, patch: Partial<TTrueFalseSentence>) => {
      const next = (data.sentences || []).map((s) =>
        s.id === sentenceId ? { ...s, ...patch } : s,
      );
      changeData("sentences", next);
    },
    [changeData, data.sentences],
  );

  const addSentence = useCallback(() => {
    changeData("sentences", [...(data.sentences || []), makeSentence()]);
  }, [changeData, data.sentences]);

  const removeSentence = useCallback(
    (sentenceId: string) => {
      const list = data.sentences || [];
      if (list.length <= 1) return;
      changeData(
        "sentences",
        list.filter((s) => s.id !== sentenceId),
      );
    },
    [changeData, data.sentences],
  );

  const onSave = useCallback(() => {
    const list = data.sentences || [];
    const invalid = list.filter((s) => !isTrueFalseSentenceValid(s));
    if (invalid.length) {
      const mark: Record<string, boolean> = {};
      invalid.forEach((s) => {
        mark[s.id] = true;
      });
      setTouched((t) => ({ ...t, ...mark }));
      toast.error(
        i18n.t("editor.trueFalseNeedText", {
          defaultValue: "В каждом предложении нужен текст",
        }),
      );
      return;
    }
    saveTrueFalseEx(data);
  }, [data, saveTrueFalseEx]);

  const previewData = useMemo(
    () => ({
      ...data,
      sentences: (data.sentences || []).filter((s) =>
        isTrueFalseSentenceValid(s),
      ),
    }),
    [data],
  );

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 md:pr-2 min-w-0">
          <TitleExInput
            label={<T k="editor.taskTitle" defaultText="Заголовок задания" />}
            value={data.title || ""}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={(data.titleColor as any) || "#3F28C6"}
          />
          <div className="h-4" />
          <TitleExInput
            label={<T k="editor.taskSubtitle" defaultText="Подзаголовок" />}
            value={data.subtitle || ""}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label={<T k="editor.description" defaultText="Описание" />}
            value={data.description || ""}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-2 min-w-0">
          <p className="font-light mb-2">
            <T k="editor.imageForTask" defaultText="Изображение для задания" />
          </p>
          <ImageUpload
            images={images || []}
            setImages={setImages}
            customPlaceHolder={
              <div
                style={{
                  width: "100%",
                  background: "#fff",
                  height: 200,
                  borderRadius: 10,
                }}
                className="flex items-center justify-center flex-col gap-4"
              >
                <Image src={GalleryIcon} alt="GalleryIcon" />
                <p
                  className="text-small text-center max-w-[250px]"
                  style={{ color: "#B7B7B7" }}
                >
                  <T
                    k="editor.dragImagesHere"
                    defaultText="Нажмите на этот блок или перетащите сюда изображения"
                  />
                </p>
              </div>
            }
          />
        </div>
      </div>

      <div className="h-6" />

      <div className={styles.header}>
        <div className={styles.question}>
          <T
            k="editor.trueFalseHowTitle"
            defaultText="Как собрать упражнение?"
          />
        </div>
        <div className={styles.hint}>
          <T
            k="editor.trueFalseHowHint"
            defaultText="Ученик прочитает предложение и выберет True или False."
          />
        </div>
        <div className={styles.howto}>
          <T
            k="editor.trueFalseHowSteps"
            defaultText="1) Введите предложение. 2) Отметьте правильный ответ — True или False. 3) При необходимости добавьте ещё предложения."
          />
        </div>
      </div>

      <div className="h-4" />

      <div className={styles.sentences}>
        {(data.sentences || []).map((sentence, index) => {
          const showError =
            touched[sentence.id] && !String(sentence.text || "").trim();
          return (
            <div key={sentence.id} className={styles.sentenceCard}>
              <div className={styles.sentenceHead}>
                <div className={styles.sentenceLabel}>
                  <T
                    k="editor.trueFalseSentenceN"
                    defaultText="Предложение {{n}}"
                    values={{ n: index + 1 }}
                  />
                </div>
                {(data.sentences || []).length > 1 && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Remove sentence"
                    onPress={() => removeSentence(sentence.id)}
                  >
                    <Image src={Close} alt="" width={14} height={14} />
                  </Button>
                )}
              </div>
              <Input
                value={sentence.text}
                placeholder={i18n.t("editor.trueFalsePlaceholder", {
                  defaultValue: "The sun rises in the east.",
                })}
                onValueChange={(val) => {
                  setTouched((t) => ({ ...t, [sentence.id]: true }));
                  updateSentence(sentence.id, { text: val });
                }}
                classNames={{
                  inputWrapper: showError
                    ? "border-2 border-[#DC2626]"
                    : undefined,
                }}
              />
              {showError && (
                <div className={styles.tokenError}>
                  <T
                    k="editor.trueFalseNeedTextShort"
                    defaultText="Введите текст предложения"
                  />
                </div>
              )}
              <div className={styles.answerRow}>
                <span className={styles.answerLabel}>
                  <T
                    k="editor.trueFalseCorrectAnswer"
                    defaultText="Правильный ответ:"
                  />
                </span>
                <Button
                  size="sm"
                  color={sentence.answer === true ? "primary" : "default"}
                  variant={sentence.answer === true ? "solid" : "bordered"}
                  className={`${styles.answerBtn} ${
                    sentence.answer === true ? styles.answerBtnActive : ""
                  }`}
                  onPress={() =>
                    updateSentence(sentence.id, { answer: true })
                  }
                >
                  True
                </Button>
                <Button
                  size="sm"
                  color={sentence.answer === false ? "primary" : "default"}
                  variant={sentence.answer === false ? "solid" : "bordered"}
                  className={`${styles.answerBtn} ${
                    sentence.answer === false ? styles.answerBtnActive : ""
                  }`}
                  onPress={() =>
                    updateSentence(sentence.id, { answer: false })
                  }
                >
                  False
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-3" />
      <div className={styles.addRow}>
        <Button color="primary" variant="flat" onPress={addSentence}>
          <T
            k="editor.trueFalseAddSentence"
            defaultText="+ Добавить предложение"
          />
        </Button>
      </div>

      <div className="h-10" />

      <div>
        <p className="font-light mb-2">
          <T k="editor.preview" defaultText="Превью" />
        </p>
        <div
          style={{
            border: "1px solid #3F28C6",
            borderRadius: 4,
            background: "#fff",
          }}
          className="pointer-events-none select-none"
        >
          {previewData.sentences.length ? (
            <TrueFalseExView data={previewData} isPreview />
          ) : (
            <div className="p-6 text-sm text-[#6b7280]">
              <T
                k="editor.trueFalsePreviewEmpty"
                defaultText="Добавьте хотя бы одно предложение с текстом, чтобы увидеть превью"
              />
            </div>
          )}
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="w-full max-w-[310px] min-w-0 lg:min-w-[310px]"
            size="lg"
            onPress={onSave}
            isLoading={isLoading}
          >
            <T k="common.save" defaultText="Сохранить" />
          </Button>
        </div>
      </div>
    </div>
  );
};
