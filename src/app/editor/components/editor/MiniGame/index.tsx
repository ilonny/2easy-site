"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from "@/app/editor/helpers";
import { ImageUpload } from "@/components/ImageUpload";
import { Button, Input } from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { MiniGameExView } from "../../view/MiniGameExView";
import { useExData } from "../hooks/useExData";
import { useUploadMiniGameEx } from "../hooks/useUploadMiniGameEx";
import { TitleExInput } from "../TitleExInput";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import {
  isMiniGameItemValid,
  minItemsForGame,
  resolveActiveGame,
  TMiniGameData,
  TMiniGameItem,
  TMiniGameKind,
  validItems,
} from "./types";
import { MINI_GAME_META } from "./constants";
import styles from "./styles.module.css";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { toast } from "react-toastify";
import Close from "@/assets/icons/close.svg";

function makeItem(term = "", definition = ""): TMiniGameItem {
  return {
    id: uuidv4(),
    term,
    definition,
  };
}

const defaultValuesStub: TMiniGameData = {
  title: "Let's play!",
  titleColor: "#3F28C6",
  subtitle: "",
  description: "",
  images: [],
  activeGame: "flash-cards",
  items: [makeItem()],
  options: {
    shuffle: true,
    showDefinitionOnWheel: false,
    flashCardsLayout: "one",
  },
};

type TProps = {
  onSuccess: (id: number) => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
  /** Chooser subItem type or `mini_game` when editing */
  templateType?: string;
};

export const MiniGame: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
  templateType,
}) => {
  const { isLoading, saveMiniGameEx, success } = useUploadMiniGameEx(
    lastSortIndex,
    currentSortIndexToShift,
  );

  const initialData = useMemo(() => {
    const activeGame = resolveActiveGame(
      templateType,
      defaultValues as TMiniGameData,
    );
    if (defaultValues) {
      const items = Array.isArray(defaultValues.items)
        ? defaultValues.items.map((i: any) => ({
            id: i?.id || uuidv4(),
            term: String(i?.term || ""),
            definition: String(i?.definition || ""),
          }))
        : [makeItem()];
      return {
        ...defaultValuesStub,
        ...defaultValues,
        activeGame,
        items: items.length ? items : [makeItem()],
        options: {
          ...defaultValuesStub.options,
          ...(defaultValues.options || {}),
        },
      } as TMiniGameData;
    }
    return { ...defaultValuesStub, activeGame };
  }, [defaultValues, templateType]);

  const { data, changeData } = useExData<TMiniGameData>(initialData);

  const [images, setImages] = useState<TMiniGameData["images"]>(
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

  const updateItem = useCallback(
    (itemId: string, patch: Partial<TMiniGameItem>) => {
      const next = (data.items || []).map((i) =>
        i.id === itemId ? { ...i, ...patch } : i,
      );
      changeData("items", next);
    },
    [changeData, data.items],
  );

  const addItem = useCallback(() => {
    changeData("items", [...(data.items || []), makeItem()]);
  }, [changeData, data.items]);

  const removeItem = useCallback(
    (itemId: string) => {
      const list = data.items || [];
      if (list.length <= 1) return;
      changeData(
        "items",
        list.filter((i) => i.id !== itemId),
      );
    },
    [changeData, data.items],
  );

  const setActiveGame = useCallback(
    (game: TMiniGameKind) => {
      changeData("activeGame", game);
    },
    [changeData],
  );

  const onSave = useCallback(() => {
    const list = data.items || [];
    const keepEmpty = data.activeGame === "flash-cards";
    const isWheel = data.activeGame === "spin-wheel";
    const isWordOnly =
      isWheel || data.activeGame === "wordsearch";
    const isHangman = data.activeGame === "hangman";
    const needsWord = isWordOnly || isHangman;
    const isItemOk = (i: TMiniGameItem) =>
      needsWord
        ? !!String(i.term || "").trim()
        : isMiniGameItemValid(i);
    const usable = keepEmpty ? list : list.filter(isItemOk);
    const min = minItemsForGame(data.activeGame);
    if (usable.length < min) {
      if (!keepEmpty) {
        const mark: Record<string, boolean> = {};
        list.forEach((i) => {
          if (!isItemOk(i)) mark[i.id] = true;
        });
        setTouched((t) => ({ ...t, ...mark }));
      }
      toast.error(
        i18n.t("editor.miniGameNeedItems", {
          defaultValue: "Нужно минимум {{n}} пар(ы)",
          n: min,
        }),
      );
      return;
    }
    saveMiniGameEx({
      ...data,
      options: {
        ...(data.options || {}),
        ...(isWheel ? { showDefinitionOnWheel: false } : {}),
      },
      items: needsWord
        ? usable.map((i) => ({
            ...i,
            term: String(i.term || "").trim(),
            definition: String(i.definition || "").trim() || undefined,
          }))
        : validItems(list, { keepEmpty }),
    });
  }, [data, saveMiniGameEx]);

  const previewData = useMemo(
    () => ({
      ...data,
      items: validItems(data.items, {
        keepEmpty: data.activeGame === "flash-cards",
      }),
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
            k="editor.miniGameHowTitle"
            defaultText="Мини-игра"
          />
        </div>
        <div className={styles.hint}>
          <T
            k="editor.miniGameHowHint"
            defaultText="Один набор слов — разные игры. Переключайте шаблон без потери контента."
          />
        </div>
        <div className={styles.howto}>
          <T
            k="editor.miniGameHowSteps"
            defaultText="1) Выберите игру. 2) Добавьте контент: лицевую и обратную сторону можно заполнить как угодно (слово/перевод, вопрос/ответ, и т.д.), любую сторону можно оставить пустой."
          />
        </div>
      </div>

      <div className="h-4" />

      <div className={styles.modeRow}>
        {MINI_GAME_META.map((m) => {
          const isActive = data.activeGame === m.id;
          return (
            <button
              key={m.id}
              type="button"
              className={`${styles.modeCard} ${isActive ? styles.modeCardActive : ""}`}
              onClick={() => setActiveGame(m.id)}
            >
              <div className={styles.modeTitle}>
                <T k={m.titleKey} defaultText={m.titleDefault} />
              </div>
              <div className={styles.modeDesc}>
                <T k={m.descKey} defaultText={m.descDefault} />
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.optionsRow}>
        <label className={styles.optionLabel}>
          <input
            type="checkbox"
            checked={!!data.options?.shuffle}
            onChange={(e) =>
              changeData("options", {
                ...(data.options || {}),
                shuffle: e.target.checked,
              })
            }
          />
          <T
            k="editor.miniGameShuffle"
            defaultText="Перемешивать"
          />
        </label>
        {data.activeGame === "flash-cards" && (
          <div className={styles.flashLayoutGroup}>
            <span className={styles.flashLayoutLabel}>
              <T
                k="editor.miniGameFlashLayout"
                defaultText="Показ карточек"
              />
            </span>
            <label className={styles.optionLabel}>
              <input
                type="radio"
                name="flashCardsLayout"
                checked={(data.options?.flashCardsLayout || "one") === "one"}
                onChange={() =>
                  changeData("options", {
                    ...(data.options || {}),
                    flashCardsLayout: "one",
                  })
                }
              />
              <T k="editor.miniGameFlashOne" defaultText="По одной" />
            </label>
            <label className={styles.optionLabel}>
              <input
                type="radio"
                name="flashCardsLayout"
                checked={data.options?.flashCardsLayout === "all"}
                onChange={() =>
                  changeData("options", {
                    ...(data.options || {}),
                    flashCardsLayout: "all",
                  })
                }
              />
              <T k="editor.miniGameFlashAll" defaultText="Все сразу" />
            </label>
          </div>
        )}
      </div>

      <div className="h-4" />

      <div className={styles.items}>
        {(data.items || []).map((item, index) => {
          const isWordOnly =
            data.activeGame === "spin-wheel" ||
            data.activeGame === "wordsearch";
          const isHangman = data.activeGame === "hangman";
          const isMatching = data.activeGame === "matching-pairs";
          const needsWord = isWordOnly || isHangman;
          const showError =
            data.activeGame !== "flash-cards" &&
            touched[item.id] &&
            (needsWord
              ? !String(item.term || "").trim()
              : !isMiniGameItemValid(item));
          const termLabel = isWordOnly
            ? i18n.t("editor.word", { defaultValue: "Слово" })
            : isHangman
              ? i18n.t("editor.miniGameSecretWord", {
                  defaultValue: "Загаданное слово",
                })
              : isMatching
                ? undefined
                : i18n.t("editor.miniGameFrontSide", {
                    defaultValue: "Лицевая сторона",
                  });
          const defLabel = isHangman
            ? i18n.t("editor.miniGameHint", { defaultValue: "Подсказка" })
            : isMatching
              ? undefined
              : i18n.t("editor.miniGameBackSide", {
                  defaultValue: "Обратная сторона",
                });
          const defPlaceholder = isHangman
            ? i18n.t("editor.miniGameHintPlaceholder", {
                defaultValue: "например: a fruit",
              })
            : i18n.t("editor.miniGameDefPlaceholder", {
                defaultValue: "например: a fruit",
              });
          return (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemHead}>
                <div className={styles.itemLabel}>
                  {needsWord ? (
                    <T
                      k="editor.miniGameWordN"
                      defaultText="Слово {{n}}"
                      values={{ n: index + 1 }}
                    />
                  ) : (
                    <T
                      k="editor.miniGameItemN"
                      defaultText="Пара {{n}}"
                      values={{ n: index + 1 }}
                    />
                  )}
                </div>
                {(data.items || []).length > 1 && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Remove item"
                    onPress={() => removeItem(item.id)}
                  >
                    <Image src={Close} alt="" width={14} height={14} />
                  </Button>
                )}
              </div>
              <div className={styles.fields}>
                <Input
                  label={termLabel}
                  aria-label={
                    isMatching
                      ? i18n.t("editor.miniGameItemN", {
                          defaultValue: "Пара {{n}}",
                          n: index + 1,
                        })
                      : undefined
                  }
                  value={item.term}
                  placeholder={i18n.t("editor.miniGameTermPlaceholder", {
                    defaultValue: "например: apple",
                  })}
                  onValueChange={(val) => {
                    setTouched((t) => ({ ...t, [item.id]: true }));
                    updateItem(item.id, { term: val });
                  }}
                  classNames={{
                    inputWrapper: showError
                      ? "border-2 border-[#DC2626]"
                      : undefined,
                  }}
                />
                {!isWordOnly && (
                  <Input
                    label={defLabel}
                    aria-label={
                      isMatching
                        ? i18n.t("editor.miniGameItemN", {
                            defaultValue: "Пара {{n}}",
                            n: index + 1,
                          })
                        : undefined
                    }
                    value={item.definition || ""}
                    placeholder={defPlaceholder}
                    onValueChange={(val) =>
                      updateItem(item.id, { definition: val })
                    }
                  />
                )}
              </div>
              {showError && (
                <div className={styles.fieldError}>
                  {needsWord ? (
                    <T
                      k="editor.miniGameNeedWord"
                      defaultText="Заполните слово"
                    />
                  ) : (
                    <T
                      k="editor.miniGameNeedTermShort"
                      defaultText="Заполните хотя бы одну сторону"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-3" />
      <div className={styles.addRow}>
        <Button color="primary" variant="flat" onPress={addItem}>
          {data.activeGame === "spin-wheel" ||
          data.activeGame === "wordsearch" ||
          data.activeGame === "hangman" ? (
            <T k="editor.miniGameAddWord" defaultText="+ Добавить слово" />
          ) : (
            <T k="editor.miniGameAddItem" defaultText="+ Добавить пару" />
          )}
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
        >
          {previewData.items.length ? (
            <div className="pointer-events-auto select-none">
              <MiniGameExView data={previewData} isPreview />
            </div>
          ) : (
            <div className="p-6 text-sm text-[#6b7280]">
              <T
                k="editor.miniGamePreviewEmpty"
                defaultText="Добавьте хотя бы одну пару, чтобы увидеть превью"
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
