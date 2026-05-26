export const CATEGORIES = [
  "🚆 交通",
  "🏨 住宿",
  "🍽 餐飲",
  "✨ 體驗",
  "🛍 購物",
  "💊 其他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLOR: Record<string, string> = {
  "🚆 交通": "var(--color-teal)",
  "🏨 住宿": "var(--color-navy)",
  "🍽 餐飲": "var(--color-orange)",
  "✨ 體驗": "var(--color-gold)",
  "🛍 購物": "var(--color-brand)",
  "💊 其他": "var(--color-muted)",
};

export function colorForCategory(category: string): string {
  return CATEGORY_COLOR[category] ?? "var(--color-muted)";
}

// Opaque, pre-blended against white card background (#ffffff) so SwipeableRow
// hides the underlying action buttons. Equivalent to the source category color
// at ~7–11% alpha, just baked.
export const CATEGORY_TINT: Record<string, string> = {
  "🚆 交通": "#ecf3f3",
  "🏨 住宿": "#eff0f3",
  "🍽 餐飲": "#fdf3eb",
  "✨ 體驗": "#f9f3e5",
  "🛍 購物": "#efece9",
  "💊 其他": "#f5f5f4",
};

export function tintForCategory(category: string): string {
  return CATEGORY_TINT[category] ?? "#ffffff";
}
