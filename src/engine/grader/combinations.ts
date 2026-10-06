/** Every way to choose `size` items, keeping the original order. */
export function combinations<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  const current: T[] = [];
  const walk = (start: number): void => {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < items.length; i++) {
      current.push(items[i]);
      walk(i + 1);
      current.pop();
    }
  };
  walk(0);
  return result;
}
