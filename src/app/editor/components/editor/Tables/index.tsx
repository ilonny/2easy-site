"use client";

import { uuidv4 } from "@/app/editor/helpers";
import { ImageUpload } from "@/components/ImageUpload";
import { Button, Input } from "@nextui-org/react";
import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TablesExView } from "../../view/TablesExView";
import { useExData } from "../hooks/useExData";
import { CreateExWithAiButton } from "../CreateExWithAiButton";
import { useUploadTablesEx } from "../hooks/useUploadTablesEx";
import { TitleExInput } from "../TitleExInput";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { toast } from "react-toastify";
import Close from "@/assets/icons/close.svg";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { domToRuns } from "./cellDom";
import {
  TABLE_TEXT_COLORS,
  TABLES_EX_TYPE,
  TABLES_MAX_COLS,
  TABLES_MAX_ROWS,
  TABLES_MAX_TABLES,
  TCellRun,
  TLessonTable,
  TTablesExerciseData,
  blankTableLike,
  canAddTable,
  clampInt,
  gridSize,
  normalizeTablesData,
  resizeGrid,
  runsToHtml,
  shrinkWouldDropContent,
  tableHasText,
} from "./tablesModel";
import styles from "./styles.module.css";

type TProps = {
  onSuccess: (id: number) => void;
  defaultValues?: Partial<TTablesExerciseData>;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

type TCellPos = { tableId: string; row: number; col: number };

type TActiveMarks = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

const CellEditor: FC<{
  runs: TCellRun[];
  placeholder: string;
  onChange: (runs: TCellRun[]) => void;
  onActivate: (el: HTMLDivElement) => void;
}> = ({ runs, placeholder, onChange, onActivate }) => {
  const ref = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);
  const runsRef = useRef(runs);
  runsRef.current = runs;
  const html = useMemo(() => runsToHtml(runs), [runs]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    const next = domToRuns(el);
    if (JSON.stringify(next) === JSON.stringify(runsRef.current)) return;
    onChange(next);
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (focusedRef.current) {
      // React may clear a contentEditable on render. Restore only a wiped cell.
      if (!el.innerHTML && html) el.innerHTML = html;
      return;
    }
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [html]);

  return (
    <div
      ref={ref}
      className={styles.cellInput}
      contentEditable
      role="textbox"
      aria-multiline="true"
      spellCheck
      data-placeholder={placeholder}
      suppressContentEditableWarning
      onFocus={() => {
        focusedRef.current = true;
        if (ref.current) onActivate(ref.current);
      }}
      onBlur={() => {
        focusedRef.current = false;
        emit();
      }}
      onInput={emit}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        const inserted = document.execCommand("insertText", false, text);
        if (!inserted) {
          const selection = document.getSelection();
          if (!selection?.rangeCount) return;
          selection.deleteFromDocument();
          const node = document.createTextNode(text);
          selection.getRangeAt(0).insertNode(node);
          selection.collapse(node, node.length);
        }
        emit();
      }}
    />
  );
};

const SizeField: FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (next: number) => boolean;
}> = ({ label, value, min, max, onCommit }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (raw: string) => {
    const next = clampInt(raw, min, max, value);
    if (next === value) {
      setDraft(String(value));
      return;
    }
    const applied = onCommit(next);
    setDraft(String(applied ? next : value));
  };

  return (
    <label className={styles.sizeField}>
      <span className={styles.sizeLabel}>{label}</span>
      <span className={styles.stepper}>
        <button
          type="button"
          className={styles.stepBtn}
          aria-label={`${label} -`}
          disabled={value <= min}
          onClick={() => onCommit(value - 1)}
        >
          −
        </button>
        <input
          className={styles.sizeInput}
          inputMode="numeric"
          type="text"
          value={draft}
          aria-label={label}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              (event.target as HTMLInputElement).blur();
            }
          }}
        />
        <button
          type="button"
          className={styles.stepBtn}
          aria-label={`${label} +`}
          disabled={value >= max}
          onClick={() => onCommit(value + 1)}
        >
          +
        </button>
      </span>
    </label>
  );
};

export const TablesEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveTablesEx, success } = useUploadTablesEx(
    lastSortIndex,
    currentSortIndexToShift,
  );

  const initialData = useMemo(
    () => normalizeTablesData(defaultValues),
    [defaultValues],
  );
  const { data, changeData, setData, resetData } =
    useExData<TTablesExerciseData>(initialData);
  const [images, setImages] = useState<TTablesExerciseData["images"]>(
    initialData.images || [],
  );
  const [openId, setOpenId] = useState<string | null>(
    initialData.tables[0]?.id ?? null,
  );
  const activeElRef = useRef<HTMLDivElement | null>(null);
  const activePosRef = useRef<TCellPos | null>(null);
  const [marks, setMarks] = useState<TActiveMarks>({
    bold: false,
    italic: false,
    underline: false,
  });

  useEffect(() => {
    changeData("images", images || []);
  }, [changeData, images]);

  useEffect(() => {
    if (!success) return;
    onSuccess?.(data.id || 0);
  }, [success, onSuccess, data.id]);

  useEffect(() => {
    activeElRef.current = null;
    activePosRef.current = null;
  }, [openId]);

  useEffect(() => {
    const syncMarks = () => {
      const el = activeElRef.current;
      const selection = document.getSelection();
      if (!el || !selection?.anchorNode || !el.contains(selection.anchorNode)) {
        return;
      }
      try {
        setMarks({
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
        });
      } catch {
        // queryCommandState is unavailable until the cell has a selection.
      }
    };
    document.addEventListener("selectionchange", syncMarks);
    return () => document.removeEventListener("selectionchange", syncMarks);
  }, []);

  const updateTable = useCallback(
    (tableId: string, patch: (table: TLessonTable) => TLessonTable) => {
      setData((prev) => ({
        ...prev,
        tables: (prev.tables || []).map((table) =>
          table.id === tableId ? patch(table) : table,
        ),
      }));
    },
    [setData],
  );

  const updateCell = useCallback(
    (pos: TCellPos, runs: TCellRun[]) => {
      updateTable(pos.tableId, (table) => ({
        ...table,
        rows: table.rows.map((row, rowIndex) =>
          rowIndex !== pos.row
            ? row
            : row.map((cell, colIndex) =>
                colIndex !== pos.col ? cell : { runs },
              ),
        ),
      }));
    },
    [updateTable],
  );

  const resizeTable = useCallback(
    (table: TLessonTable, nextRows: number, nextCols: number) => {
      const size = gridSize(table);
      const rows = clampInt(nextRows, 1, TABLES_MAX_ROWS, size.rows);
      const cols = clampInt(nextCols, 1, TABLES_MAX_COLS, size.cols);
      if (rows === size.rows && cols === size.cols) return false;
      if (shrinkWouldDropContent(table, rows, cols)) {
        const ok = window.confirm(
          i18n.t("editor.tablesShrinkConfirm", {
            defaultValue:
              "В строках или колонках, которые будут удалены, есть текст. Удалить их?",
          }),
        );
        if (!ok) return false;
      }
      activeElRef.current = null;
      activePosRef.current = null;
      updateTable(table.id, (current) => ({
        ...current,
        rows: resizeGrid(current.rows, rows, cols),
      }));
      return true;
    },
    [updateTable],
  );

  const addTable = useCallback(() => {
    if (!canAddTable(data.tables)) {
      toast.info(
        i18n.t("editor.tablesLimit", {
          defaultValue:
            "В одном задании можно до 10 таблиц. Добавьте ещё одно задание «Таблицы», если нужно больше.",
          count: TABLES_MAX_TABLES,
        }),
      );
      return;
    }
    const id = uuidv4();
    const last = data.tables[data.tables.length - 1];
    const next = blankTableLike(last, id);
    changeData("tables", [...data.tables, next]);
    setOpenId(id);
  }, [changeData, data.tables]);

  const removeTable = useCallback(
    (table: TLessonTable) => {
      if ((data.tables || []).length <= 1) return;
      if (tableHasText(table)) {
        const ok = window.confirm(
          i18n.t("editor.tablesRemoveConfirm", {
            defaultValue: "Удалить эту таблицу вместе с текстом?",
          }),
        );
        if (!ok) return;
      }
      const next = data.tables.filter((item) => item.id !== table.id);
      changeData("tables", next);
      if (openId === table.id) setOpenId(next[0]?.id ?? null);
    },
    [changeData, data.tables, openId],
  );

  const applyCommand = useCallback(
    (command: string, value?: string) => {
      const el = activeElRef.current;
      const pos = activePosRef.current;
      if (!el || !pos) {
        toast.info(
          i18n.t("editor.tablesNeedCell", {
            defaultValue: "Поставьте курсор в ячейку и выделите текст",
          }),
        );
        return;
      }
      el.focus();
      document.execCommand(command, false, value);
      updateCell(pos, domToRuns(el));
    },
    [updateCell],
  );

  const onSave = useCallback(() => {
    const normalized = normalizeTablesData({ ...data, images });
    saveTablesEx({
      ...normalized,
      id: data.id,
      sortIndex: data.sortIndex,
      images,
    });
  }, [data, images, saveTablesEx]);

  const previewData = useMemo(
    () => normalizeTablesData({ ...data, images }),
    [data, images],
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
            selectedColor={data.titleColor || "#3F28C6"}
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
          <CreateExWithAiButton
            type={TABLES_EX_TYPE}
            currentData={data as Record<string, unknown>}
            onApply={(generated) => {
              const next = normalizeTablesData({
                ...generated,
                id: data.id,
                sortIndex: data.sortIndex,
              });
              resetData(next);
              setImages(
                Array.isArray(generated.images) ? generated.images : images,
              );
              setOpenId(next.tables[0]?.id ?? null);
            }}
          />
        </div>
      </div>

      <div className="h-6" />

      <div className={styles.header}>
        <div className={styles.question}>
          <T
            k="editor.tablesHowTitle"
            defaultText="Как собрать упражнение?"
          />
        </div>
        <div className={styles.hint}>
          <T
            k="editor.tablesHowHint"
            defaultText="Для грамматики и лексики: несколько таблиц в одном задании, свои строки и колонки."
          />
        </div>
        <div className={styles.howto}>
          <T
            k="editor.tablesHowSteps"
            defaultText="1) Добавьте столько таблиц, сколько нужно (до 10). 2) Задайте число строк и колонок (до 10). 3) Впишите текст. Выделите фрагмент в ячейке, чтобы сделать курсив, жирный, подчёркивание или цвет."
          />
        </div>
      </div>

      <div className="h-4" />

      <div className={styles.list}>
        {(data.tables || []).map((table, index) => {
          const size = gridSize(table);
          const open = openId === table.id;
          return (
            <div key={table.id} className={styles.card}>
              <div className={styles.cardHead}>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setOpenId(open ? null : table.id)}
                >
                  <div className={styles.cardTitle}>
                    <T
                      k="editor.tablesTableN"
                      defaultText="Таблица {{n}}"
                      values={{ n: index + 1 }}
                    />
                  </div>
                  <div className={styles.cardMeta}>
                    {size.rows}×{size.cols}
                    {table.caption?.trim() ? ` · ${table.caption.trim()}` : ""}
                  </div>
                </button>
                <div className={styles.cardActions}>
                  {(data.tables || []).length > 1 && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      aria-label={i18n.t("editor.tablesRemove", {
                        defaultValue: "Удалить таблицу",
                      })}
                      onPress={() => removeTable(table)}
                    >
                      <Image src={Close} alt="" width={14} height={14} />
                    </Button>
                  )}
                </div>
              </div>

              {open && (
                <div className={styles.body}>
                  <Input
                    label={
                      <T
                        k="editor.tablesCaption"
                        defaultText="Название таблицы"
                      />
                    }
                    value={table.caption || ""}
                    placeholder={i18n.t("editor.tablesCaptionPlaceholder", {
                      defaultValue: "Present Simple",
                    })}
                    onValueChange={(val) =>
                      updateTable(table.id, (current) => ({
                        ...current,
                        caption: val.slice(0, 200),
                      }))
                    }
                  />

                  <div className={styles.sizeRow}>
                    <SizeField
                      label={i18n.t("editor.tablesRows", {
                        defaultValue: "Строки",
                      })}
                      value={size.rows}
                      min={1}
                      max={TABLES_MAX_ROWS}
                      onCommit={(next) => resizeTable(table, next, size.cols)}
                    />
                    <SizeField
                      label={i18n.t("editor.tablesCols", {
                        defaultValue: "Колонки",
                      })}
                      value={size.cols}
                      min={1}
                      max={TABLES_MAX_COLS}
                      onCommit={(next) => resizeTable(table, size.rows, next)}
                    />
                    <label className={styles.check}>
                      <input
                        type="checkbox"
                        checked={table.headerRow !== false}
                        onChange={(event) =>
                          updateTable(table.id, (current) => ({
                            ...current,
                            headerRow: event.target.checked,
                          }))
                        }
                      />
                      <T
                        k="editor.tablesHeaderRow"
                        defaultText="Первая строка — заголовок"
                      />
                    </label>
                  </div>

                  <div className={styles.toolbar}>
                    <button
                      type="button"
                      className={`${styles.toolBtn} ${marks.bold ? styles.toolBtnActive : ""}`}
                      aria-label={i18n.t("editor.tablesBold", {
                        defaultValue: "Жирный",
                      })}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        applyCommand("bold");
                      }}
                    >
                      <span className={styles.iconBold}>B</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolBtn} ${marks.italic ? styles.toolBtnActive : ""}`}
                      aria-label={i18n.t("editor.tablesItalic", {
                        defaultValue: "Курсив",
                      })}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        applyCommand("italic");
                      }}
                    >
                      <span className={styles.iconItalic}>I</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolBtn} ${marks.underline ? styles.toolBtnActive : ""}`}
                      aria-label={i18n.t("editor.tablesUnderline", {
                        defaultValue: "Подчёркивание",
                      })}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        applyCommand("underline");
                      }}
                    >
                      <span className={styles.iconUnderline}>U</span>
                    </button>
                    {TABLE_TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={styles.toolBtn}
                        aria-label={i18n.t("editor.tablesColor", {
                          defaultValue: "Цвет {{color}}",
                          color,
                        })}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          applyCommand("foreColor", color);
                        }}
                      >
                        <span
                          className={styles.swatch}
                          style={{ background: color }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className={styles.formatHint}>
                    <T
                      k="editor.tablesFormatHint"
                      defaultText="Выделите текст в ячейке, затем нажмите курсив, жирный или цвет."
                    />
                  </div>

                  <div className={styles.scroll}>
                    <table className={styles.grid}>
                      <tbody>
                        {table.rows.map((row, rowIndex) => (
                          <tr key={`${table.id}-${rowIndex}`}>
                            {row.map((cell, colIndex) => {
                              const isHead =
                                table.headerRow !== false && rowIndex === 0;
                              return (
                                <td
                                  key={`${table.id}-${rowIndex}-${colIndex}`}
                                  className={`${styles.gridCell} ${isHead ? styles.gridHead : ""}`}
                                >
                                  <CellEditor
                                    runs={cell.runs}
                                    placeholder={i18n.t(
                                      "editor.tablesCellPlaceholder",
                                      { defaultValue: "Текст" },
                                    )}
                                    onActivate={(el) => {
                                      activeElRef.current = el;
                                      activePosRef.current = {
                                        tableId: table.id,
                                        row: rowIndex,
                                        col: colIndex,
                                      };
                                    }}
                                    onChange={(runs) =>
                                      updateCell(
                                        {
                                          tableId: table.id,
                                          row: rowIndex,
                                          col: colIndex,
                                        },
                                        runs,
                                      )
                                    }
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-3" />
      <div className={styles.addRow}>
        <Button
          color="primary"
          variant="flat"
          onPress={addTable}
          isDisabled={!canAddTable(data.tables)}
        >
          <T
            k="editor.tablesAdd"
            defaultText="+ Добавить таблицу"
          />
        </Button>
        <div className={styles.limit}>
          <T
            k="editor.tablesCount"
            defaultText="{{count}} из {{max}} таблиц в этом задании"
            values={{
              count: data.tables?.length || 0,
              max: TABLES_MAX_TABLES,
            }}
          />
        </div>
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
          <TablesExView data={previewData} isPreview />
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
