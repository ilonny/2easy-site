"use client";

import { FC, Fragment } from "react";
import {
  TCellRun,
  TLessonTable,
  TTablesExerciseData,
  cellPlainText,
} from "../../editor/Tables/tablesModel";
import styles from "./styles.module.css";

function Runs({ runs }: { runs: TCellRun[] }) {
  const visible = (runs || []).filter((run) => run.text);
  if (!visible.length) return null;
  return (
    <>
      {visible.map((run, index) => {
        const style: Record<string, string> = {};
        if (run.bold) style.fontWeight = "700";
        if (run.italic) style.fontStyle = "italic";
        if (run.underline) style.textDecoration = "underline";
        if (run.color) style.color = run.color;
        const parts = run.text.split("\n");
        return (
          <span key={index} style={style}>
            {parts.map((part, partIndex) => (
              <Fragment key={partIndex}>
                {partIndex > 0 ? <br /> : null}
                {part}
              </Fragment>
            ))}
          </span>
        );
      })}
    </>
  );
}

function TableFigure({ table }: { table: TLessonTable }) {
  const rows = table.rows || [];
  if (!rows.length) return null;
  return (
    <figure className={styles.figure}>
      {!!table.caption?.trim() && (
        <figcaption className={styles.caption}>{table.caption}</figcaption>
      )}
      <div className={styles.scroll}>
        <table className={styles.table}>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${table.id}-r${rowIndex}`}>
                {row.map((cell, colIndex) => {
                  const isHead = !!table.headerRow && rowIndex === 0;
                  const Tag = isHead ? "th" : "td";
                  return (
                    <Tag
                      key={`${table.id}-c${rowIndex}-${colIndex}`}
                      className={`${styles.cell} ${isHead ? styles.head : ""}`}
                      scope={isHead ? "col" : undefined}
                    >
                      {cellPlainText(cell).trim() ? (
                        <Runs runs={cell.runs} />
                      ) : (
                        "\u00a0"
                      )}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export const TablesExView: FC<{
  data: TTablesExerciseData;
  isPreview?: boolean;
}> = ({ data }) => {
  const tables = data?.tables || [];
  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className="exercise-view-head py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto">
        {!!data?.title && (
          <p className="exercise-view-title" style={{ color: data.titleColor }}>
            {data.title}
          </p>
        )}
        {!!data?.subtitle && (
          <p className="exercise-view-subtitle">{data.subtitle}</p>
        )}
        {!!data?.description && (
          <p className={`exercise-view-desc ${styles.desc}`}>{data.description}</p>
        )}
      </div>
      <div className={styles.stack}>
        {tables.map((table) => (
          <TableFigure key={table.id} table={table} />
        ))}
      </div>
    </div>
  );
};
