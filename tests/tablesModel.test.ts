import assert from "node:assert/strict";
import test from "node:test";
import {
  TABLES_MAX_COLS,
  TABLES_MAX_ROWS,
  TABLES_MAX_TABLES,
  blankTableLike,
  canAddTable,
  cellIsEmpty,
  cssColorToHex,
  normalizeTablesData,
  resizeGrid,
  runsToHtml,
  sanitizeRuns,
  shrinkWouldDropContent,
  tableHasText,
  createTable,
} from "../src/app/editor/components/editor/Tables/tablesModel.ts";

test("resizeGrid keeps existing text and pads new cells", () => {
  const next = resizeGrid(
    [[{ runs: [{ text: "I" }] }, { runs: [{ text: "am" }] }]],
    2,
    3,
  );
  assert.equal(next.length, 2);
  assert.equal(next[0].length, 3);
  assert.equal(next[0][0].runs[0].text, "I");
  assert.equal(next[0][1].runs[0].text, "am");
  assert.equal(cellIsEmpty(next[0][2]), true);
  assert.equal(cellIsEmpty(next[1][0]), true);
});

test("resizeGrid clamps to the teacher limits", () => {
  const rows = Array.from({ length: 14 }, (_, r) =>
    Array.from({ length: 14 }, (_, c) => ({
      runs: [{ text: `${r}:${c}` }],
    })),
  );
  const next = resizeGrid(rows, 99, 99);
  assert.equal(next.length, TABLES_MAX_ROWS);
  assert.equal(next[0].length, TABLES_MAX_COLS);
  assert.equal(next[9][9].runs[0].text, "9:9");
});

test("shrinkWouldDropContent ignores empty cells and flags filled ones", () => {
  const table = createTable("t", { rows: 2, cols: 2 });
  assert.equal(shrinkWouldDropContent(table, 1, 1), false);
  table.rows[1][1] = { runs: [{ text: "was", italic: true }] };
  assert.equal(shrinkWouldDropContent(table, 1, 2), true);
  assert.equal(shrinkWouldDropContent(table, 2, 1), true);
  assert.equal(shrinkWouldDropContent(table, 2, 2), false);
});

test("sanitizeRuns merges marks, drops unsafe colors, escapes nothing in text", () => {
  const runs = sanitizeRuns([
    { text: "go", italic: true, color: "red" },
    { text: "es", italic: true, color: "javascript:alert(1)" },
    { text: "!", bold: true, color: "#dc2626" },
  ]);
  assert.equal(runs.length, 2);
  assert.equal(runs[0].text, "goes");
  assert.equal(runs[0].italic, true);
  assert.equal(runs[0].color, undefined);
  assert.equal(runs[1].text, "!");
  assert.equal(runs[1].bold, true);
  assert.equal(runs[1].color, "#dc2626");
});

test("runsToHtml escapes markup and keeps italic", () => {
  const html = runsToHtml([
    { text: "<script>alert(1)</script>", italic: true },
    { text: "\n", color: "#111827" },
    { text: "ok", color: "red" },
  ]);
  assert.equal(
    html,
    '<i>&lt;script&gt;alert(1)&lt;/script&gt;</i><span style="color: #111827"><br></span>ok',
  );
});

test("cssColorToHex reads hex and rgb from contentEditable", () => {
  assert.equal(cssColorToHex("#dc2626"), "#DC2626");
  assert.equal(cssColorToHex("rgb(220, 38, 38)"), "#DC2626");
  assert.equal(cssColorToHex("rgba(37, 99, 235, 0.9)"), "#2563EB");
  assert.equal(cssColorToHex("expression(alert(1))"), undefined);
});

test("normalizeTablesData caps table count and repairs ragged grids", () => {
  const tables = Array.from({ length: TABLES_MAX_TABLES + 3 }, (_, i) => ({
    id: `t-${i}`,
    caption: "x".repeat(500),
    headerRow: i === 0 ? false : undefined,
    rows:
      i === 0
        ? [
            [{ runs: [{ text: "A" }] }, { runs: [{ text: "B", italic: true }] }],
            [{ runs: [{ text: "C" }] }],
          ]
        : [[{ runs: [{ text: "z" }] }]],
  }));
  const data = normalizeTablesData({
    title: "Present Simple",
    titleColor: "not-a-color",
    tables,
  });
  assert.equal(data.tables.length, TABLES_MAX_TABLES);
  assert.equal(data.titleColor, "#3F28C6");
  assert.equal(data.tables[0].headerRow, false);
  assert.equal(data.tables[0].caption.length, 200);
  assert.equal(data.tables[0].rows.length, 2);
  assert.equal(data.tables[0].rows[1].length, 2);
  assert.equal(data.tables[0].rows[1][1].runs[0].text, "");
  assert.equal(data.tables[0].rows[0][1].runs[0].italic, true);
  assert.equal(canAddTable(data.tables), false);
});

test("empty payload starts from one blank table", () => {
  const data = normalizeTablesData(null);
  assert.equal(data.tables.length, 1);
  assert.equal(data.tables[0].rows.length, 3);
  assert.equal(data.tables[0].rows[0].length, 3);
  assert.equal(data.title, "Let's look!");
});

test("blankTableLike copies shape, not cell text", () => {
  const source = createTable("src", { rows: 4, cols: 2, headerRow: false });
  source.rows[0][0] = { runs: [{ text: "Subject" }] };
  source.caption = "be";
  const copy = blankTableLike(source, "next");
  assert.equal(copy.rows.length, 4);
  assert.equal(copy.rows[0].length, 2);
  assert.equal(copy.headerRow, false);
  assert.equal(copy.caption, "");
  assert.equal(tableHasText(copy), false);
  assert.equal(tableHasText(source), true);
});
