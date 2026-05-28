import type { Day, TimelineItem } from "@/lib/types";

// Remove per-item rating & comment from each day's timeline. Used on
// /samples/[id] and /s/[token] when the trip's share_show_feedback flag
// is false — keeps owner-only feedback out of the wire payload reaching
// non-owner viewers.
export function stripFeedbackFromDays(days: Day[]): Day[] {
  return days.map((d) => ({
    ...d,
    timeline: d.timeline.map((it): TimelineItem => {
      const clean = { ...it };
      delete clean.rating;
      delete clean.comment;
      return clean;
    }),
  }));
}
