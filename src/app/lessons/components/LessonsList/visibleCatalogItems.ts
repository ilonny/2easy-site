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
