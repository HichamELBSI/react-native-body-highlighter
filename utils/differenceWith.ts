export function differenceWith<T>(
  pred: (a: T, b: T) => boolean,
  list1: ReadonlyArray<T>,
  list2: ReadonlyArray<T>
): T[] {
  if (!Array.isArray(list1) || list1.length === 0) return [];
  if (!Array.isArray(list2) || list2.length === 0) return [...list1];

  // Return items from list1 that do not match any item in list2 by the predicate
  return list1.filter((a) => !list2.some((b) => pred(a, b)));
}
