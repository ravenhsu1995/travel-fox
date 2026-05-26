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
  "🚆 交通": "var(--color-info)",
  "🏨 住宿": "var(--color-navy)",
  "🍽 餐飲": "var(--color-orange)",
  "✨ 體驗": "var(--color-teal)",
  "🛍 購物": "var(--color-gold)",
  "💊 其他": "var(--color-muted)",
};

export function colorForCategory(category: string): string {
  return CATEGORY_COLOR[category] ?? "var(--color-muted)";
}

export const CATEGORY_TINT: Record<string, string> = {
  "🚆 交通": "rgba(37, 112, 184, 0.08)",
  "🏨 住宿": "rgba(28, 43, 82, 0.07)",
  "🍽 餐飲": "rgba(232, 132, 58, 0.10)",
  "✨ 體驗": "rgba(46, 120, 120, 0.09)",
  "🛍 購物": "rgba(196, 144, 15, 0.11)",
  "💊 其他": "rgba(112, 105, 96, 0.07)",
};

export function tintForCategory(category: string): string {
  return CATEGORY_TINT[category] ?? "var(--color-card-pure)";
}
