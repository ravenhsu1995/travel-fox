export type InAppBrowserKind =
  | "line"
  | "facebook"
  | "instagram"
  | "twitter"
  | "wechat"
  | "tiktok"
  | null;

export function detectInAppBrowser(
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
): InAppBrowserKind {
  if (!ua) return null;
  if (/\bLine\//i.test(ua)) return "line";
  if (/\b(FBAN|FBAV|FB_IAB)\b/.test(ua)) return "facebook";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/\bTwitter\b/.test(ua)) return "twitter";
  if (/MicroMessenger/i.test(ua)) return "wechat";
  if (/musical_ly|Bytedance|TikTok/i.test(ua)) return "tiktok";
  return null;
}

export const IN_APP_BROWSER_LABEL: Record<
  NonNullable<InAppBrowserKind>,
  string
> = {
  line: "LINE",
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "X",
  wechat: "微信",
  tiktok: "TikTok",
};
