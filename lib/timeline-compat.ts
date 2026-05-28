import type { Day, SpotItem, TimelineItem } from "@/lib/types";

type LegacyExperienceItem = Omit<SpotItem, "name"> & {
  spot?: string;
  name?: string;
};

type LegacyTimelineItem = Omit<TimelineItem, "type" | "spot"> & {
  type: "exp";
  exp?: LegacyExperienceItem;
};

export function normalizeTimelineItem(
  item: TimelineItem | LegacyTimelineItem,
): TimelineItem {
  if (item.type !== "exp") return item;

  const { exp, ...rest } = item;
  const { spot: legacyName, name, ...spotRest } = exp ?? {};

  return {
    ...rest,
    type: "spot",
    spot: {
      ...spotRest,
      name: name ?? legacyName ?? "",
    },
  };
}

export function normalizeTimeline(
  timeline: Array<TimelineItem | LegacyTimelineItem>,
): TimelineItem[] {
  return timeline.map(normalizeTimelineItem);
}

export function normalizeDays(days: Day[]): Day[] {
  return days.map((day) => ({
    ...day,
    timeline: normalizeTimeline(day.timeline as Array<TimelineItem | LegacyTimelineItem>),
  }));
}
