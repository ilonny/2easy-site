/**
 * Lesson and folder grids render in pages (the scroll sentinel grows the
 * window). Course grids do not: "Мои курсы" turns the sentinel off so a
 * reorder always covers the whole list. The window must not still apply,
 * or every course past the first page exists in data (search finds it)
 * but never paints.
 */
export function selectVisibleCatalogItems<T>(
  items: T[],
  visibleCount: number,
  isCourses: boolean,
): T[] {
  if (isCourses) return items;
  const count = Number.isFinite(visibleCount)
    ? Math.max(0, Math.floor(visibleCount))
    : 0;
  return items.slice(0, count);
}

/**
 * Drag-reorder only sees the rendered window. The saved order must still
 * contain every item past that window, otherwise a course save drops them.
 */
export function applyWindowedReorder<T>(
  items: T[],
  visibleCount: number,
  showAll: boolean,
  oldIndex: number,
  newIndex: number,
): T[] {
  if (
    oldIndex < 0 ||
    newIndex < 0 ||
    oldIndex === newIndex ||
    !Number.isInteger(oldIndex) ||
    !Number.isInteger(newIndex)
  ) {
    return items;
  }
  const count = showAll
    ? items.length
    : Number.isFinite(visibleCount)
      ? Math.max(0, Math.min(items.length, Math.floor(visibleCount)))
      : 0;
  if (oldIndex >= count || newIndex >= count) return items;
  const visible = items.slice(0, count);
  const rest = items.slice(count);
  const next = visible.slice();
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return [...next, ...rest];
}
