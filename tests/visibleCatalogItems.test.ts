import assert from "node:assert/strict";
import test from "node:test";
import { selectVisibleCatalogItems } from "../src/app/lessons/components/LessonsList/visibleCatalogItems.ts";

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
