export const ACTIVE_FAMILY_COOKIE = "pws-active-family";

export function resolveActiveItem<T extends { id: string }>(
  items: T[],
  activeItemId?: string | null,
): T | null {
  if (items.length === 0) {
    return null;
  }

  if (activeItemId) {
    const matchingItem = items.find((item) => item.id === activeItemId);

    if (matchingItem) {
      return matchingItem;
    }
  }

  return items[0];
}
