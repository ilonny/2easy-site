"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from "@/app/editor/helpers";
import { ImageUpload } from "@/components/ImageUpload";
import { Button, Input } from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { UnscrambleWordsExView } from "../../view/UnscrambleWordsExView";
import { useExData } from "../hooks/useExData";
import { useUploadUnscrambleWordsEx } from "../hooks/useUploadUnscrambleWordsEx";
import { TitleExInput } from "../TitleExInput";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import {
  isUnscrambleSentenceValid,
  parseUnscrambleTokenValues,
  TUnscrambleSentence,
  TUnscrambleWordsData,
} from "./types";
import styles from "./styles.module.css";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { toast } from "react-toastify";
import Close from "@/assets/icons/close.svg";

function makeSentence(raw = ""): TUnscrambleSentence {
  const values = parseUnscrambleTokenValues(raw);
  return {
    id: uuidv4(),
    raw,
    tokens: values.map((value) => ({ id: uuidv4(), value })),
  };
}

const defaultValuesStub: TUnscrambleWordsData = {
  title: "Let's practice!",
  titleColor: "#3F28C6",
  subtitle: "Put the words in the correct order",
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

export const UnscrambleWords: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveUnscrambleWordsEx, success } =
    useUploadUnscrambleWordsEx(lastSortIndex, currentSortIndexToShift);

  const initialData = useMemo(() => {
    if (defaultValues) {
      const sentences = Array.isArray(defaultValues.sentences)
        ? defaultValues.sentences
        : [makeSentence()];
      return {
        ...defaultValuesStub,
        ...defaultValues,
        sentences: sentences.length ? sentences : [makeSentence()],
      } as TUnscrambleWordsData;
    }
    return defaultValuesStub;
  }, [defaultValues]);

  const { data, changeData, resetData } =
    useExData<TUnscrambleWordsData>(initialData);

  const [images, setImages] = useState<TUnscrambleWordsData["images"]>(
    defaultValues?.images || [],
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    changeData("images", images || []);
  }, [changeData, images]);

  useEffect(() => {
    if (success) {
      onSuccess?.((data as any)?.id || 0);
      resetData({ ...defaultValuesStub, sentences: [makeSentence()] });
    }
  }, [data, onSuccess, resetData, success]);

  const updateSentenceRaw = useCallback(
    (sentenceId: string, raw: string) => {
      const next = (data.sentences || []).map((s) => {
        if (s.id !== sentenceId) return s;
        const values = parseUnscrambleTokenValues(raw);
        const prev = s.tokens || [];
        const tokens = values.map((value, i) => ({
          id: prev[i]?.value === value ? prev[i].id : uuidv4(),
          value,
        }));
        return { ...s, raw, tokens };
      });
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
    const invalid = list.filter((s) => !isUnscrambleSentenceValid(s.raw));
    if (invalid.length) {
      const mark: Record<string, boolean> = {};
      invalid.forEach((s) => {
        mark[s.id] = true;
      });
      setTouched((t) => ({ ...t, ...mark }));
      toast.error(
        i18n.t("editor.unscrambleNeedSlash", {
          defaultValue:
            "В каждом предложении нужен хотя бы один «/» (минимум 2 фрагмента)",
        }),
      );
      return;
    }
    saveUnscrambleWordsEx(data);
  }, [data, saveUnscrambleWordsEx]);

  const previewData = useMemo(
    () => ({
      ...data,
      sentences: (data.sentences || []).filter((s) =>
        isUnscrambleSentenceValid(s.raw),
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
            k="editor.unscrambleHowTitle"
            defaultText="Как собрать упражнение?"
          />
        </div>
        <div className={styles.hint}>
          <T
            k="editor.unscrambleHowHint"
            defaultText="Ученик перетащит перемешанные фрагменты в пустые ячейки в правильном порядке."
          />
        </div>
        <div className={styles.howto}>
          <T
            k="editor.unscrambleHowSteps"
            defaultText="1) Введите предложение. 2) Поставьте «/» там, где нужно разделить на чипсы (например: She / is / a / teacher.). 3) При необходимости добавьте ещё предложения. В каждом предложении должен быть хотя бы один «/»."
          />
        </div>
      </div>

      <div className="h-4" />

      <div className={styles.sentences}>
        {(data.sentences || []).map((sentence, index) => {
          const showError =
            touched[sentence.id] && !isUnscrambleSentenceValid(sentence.raw);
          return (
            <div key={sentence.id} className={styles.sentenceCard}>
              <div className={styles.sentenceHead}>
                <div className={styles.sentenceLabel}>
                  <T
                    k="editor.unscrambleSentenceN"
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
                value={sentence.raw}
                placeholder={i18n.t("editor.unscramblePlaceholder", {
                  defaultValue: "She / is / a / teacher.",
                })}
                onValueChange={(val) => {
                  setTouched((t) => ({ ...t, [sentence.id]: true }));
                  updateSentenceRaw(sentence.id, val);
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
                    k="editor.unscrambleNeedSlashShort"
                    defaultText="Нужен «/» и минимум 2 фрагмента"
                  />
                </div>
              )}
              {!!sentence.tokens?.length && (
                <div className={styles.tokenPreview}>
                  {sentence.tokens.map((t) => (
                    <span key={t.id} className={styles.tokenChip}>
                      {t.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-3" />
      <div className={styles.addRow}>
        <Button color="primary" variant="flat" onPress={addSentence}>
          <T
            k="editor.unscrambleAddSentence"
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
            <UnscrambleWordsExView data={previewData} isPreview />
          ) : (
            <div className="p-6 text-sm text-[#6b7280]">
              <T
                k="editor.unscramblePreviewEmpty"
                defaultText="Добавьте хотя бы одно предложение с «/», чтобы увидеть превью"
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
