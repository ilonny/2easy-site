import assert from "node:assert/strict";
import test from "node:test";
import {
  applyWindowedReorder,
  selectVisibleCatalogItems,
} from "../src/app/lessons/components/LessonsList/visibleCatalogItems.ts";

const INITIAL_LESSON_BATCH = 24;

const items = (count: number, titleAt?: { index: number; title: string }) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title:
      titleAt && titleAt.index === index ? titleAt.title : `item ${index + 1}`,
  }));

test("course lists render every course, including ones past the first page", () => {
  const courses = items(30, { index: 27, title: "general course b2" });
  const visible = selectVisibleCatalogItems(
    courses,
    INITIAL_LESSON_BATCH,
    true,
  );

  assert.equal(visible.length, 30);
  assert.equal(
    visible.find((course) => course.title === "general course b2")?.id,
    28,
  );
});

test("a search hit past the first page stays visible on the courses tab", () => {
  const courses = items(40);
  const query = "yesterday course";
  courses[35] = { id: 36, title: query };
  const filtered = courses.filter((course) =>
    course.title.toLowerCase().includes(query),
  );
  const visible = selectVisibleCatalogItems(
    filtered,
    INITIAL_LESSON_BATCH,
    true,
  );

  assert.deepEqual(
    visible.map((course) => course.title),
    [query],
  );
});

test("reordering the first page keeps lessons past that page", () => {
  const lessons = items(30);
  const reordered = applyWindowedReorder(lessons, INITIAL_LESSON_BATCH, false, 0, 2);

  assert.equal(reordered.length, 30);
  assert.equal(reordered[0].id, 2);
  assert.equal(reordered[1].id, 3);
  assert.equal(reordered[2].id, 1);
  assert.equal(reordered[24].id, 25);
  assert.equal(reordered[29].id, 30);
});

test("a full list reorder does not invent a hidden tail", () => {
  const lessons = items(5);
  const reordered = applyWindowedReorder(lessons, 2, true, 0, 4);
  assert.deepEqual(
    reordered.map((lesson) => lesson.id),
    [2, 3, 4, 5, 1],
  );
});

test("lesson and folder lists stay windowed until the sentinel grows the page", () => {
  const lessons = items(30, { index: 26, title: "folder past first page" });
  const firstPage = selectVisibleCatalogItems(
    lessons,
    INITIAL_LESSON_BATCH,
    false,
  );
  assert.equal(firstPage.length, INITIAL_LESSON_BATCH);
  assert.equal(
    firstPage.some((lesson) => lesson.title === "folder past first page"),
    false,
  );

  const nextPage = selectVisibleCatalogItems(lessons, 48, false);
  assert.equal(nextPage.length, 30);
  assert.equal(nextPage[26].title, "folder past first page");
});
