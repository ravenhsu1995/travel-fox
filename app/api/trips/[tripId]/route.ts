import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import { normalizeJoinedLocationChips } from "@/lib/location-chips";
import type { Day } from "@/lib/types";

type SaveTripBody = {
  title?: unknown;
  subtitle?: unknown;
  cover_emoji?: unknown;
  start_date?: unknown;
  end_date?: unknown;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function eachDate(start: string, end: string): string[] {
  const out: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);

  while (cursor.getTime() <= last.getTime()) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return out;
}

function dayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()} (${weekdays[date.getUTCDay()]})`;
}

async function syncTripDays(
  tripId: string,
  startDate: string,
  endDate: string,
  jwt: string,
): Promise<{ ok: true; days: Day[] } | { ok: false; error: string }> {
  const existingResult = await pgrest<Day[]>({
    method: "GET",
    path: `/rest/v1/days?select=id,trip_id,date,day_label,theme,hotel,timeline,sort_order&trip_id=eq.${tripId}&order=date`,
    jwt,
  });
  if (!existingResult.ok) return existingResult;

  const existingDays = existingResult.data ?? [];
  const existingDates = new Set(existingDays.map((day) => day.date));
  const missingDates = eachDate(startDate, endDate).filter(
    (date) => !existingDates.has(date),
  );

  let insertedDays: Day[] = [];
  if (missingDates.length > 0) {
    const insertResult = await pgrest<Day[]>({
      method: "POST",
      path: "/rest/v1/days?select=id,trip_id,date,day_label,theme,hotel,timeline,sort_order",
      jwt,
      returnRow: true,
      body: missingDates.map((date) => ({
        trip_id: tripId,
        date,
        day_label: dayLabel(date),
        theme: null,
        hotel: null,
        timeline: [],
        sort_order: 0,
      })),
    });
    if (!insertResult.ok) return insertResult;
    insertedDays = insertResult.data ?? [];
  }

  const sortedDays = [...existingDays, ...insertedDays].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const sortResults = await Promise.all(
    sortedDays.map((day, index) => {
      if (day.sort_order === index) {
        return Promise.resolve({ ok: true as const, data: undefined });
      }
      return pgrest({
        method: "PATCH",
        path: `/rest/v1/days?id=eq.${day.id}&trip_id=eq.${tripId}`,
        jwt,
        body: { sort_order: index },
      });
    }),
  );
  for (const sortResult of sortResults) {
    if (!sortResult.ok) return sortResult;
  }

  const refreshedResult = await pgrest<Day[]>({
    method: "GET",
    path: `/rest/v1/days?select=id,trip_id,date,day_label,theme,hotel,timeline,sort_order&trip_id=eq.${tripId}&order=sort_order`,
    jwt,
  });
  if (!refreshedResult.ok) return refreshedResult;

  return { ok: true, days: refreshedResult.data ?? [] };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
    }

    const { tripId } = await params;
    const body = (await request.json()) as SaveTripBody;
    const title = asTrimmedString(body.title);
    const subtitle = normalizeJoinedLocationChips(asTrimmedString(body.subtitle));
    const coverEmoji = asTrimmedString(body.cover_emoji) || "🗺️";
    const startDate = asTrimmedString(body.start_date);
    const endDate = asTrimmedString(body.end_date);

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "請輸入行程標題" },
        { status: 400 },
      );
    }
    if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
      return NextResponse.json(
        { ok: false, error: "請選擇有效的起訖日期" },
        { status: 400 },
      );
    }
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { ok: false, error: "結束日不能早於開始日" },
        { status: 400 },
      );
    }

    const result = await pgrest({
      method: "PATCH",
      path: `/rest/v1/trips?id=eq.${tripId}`,
      jwt,
      body: {
        title,
        subtitle,
        cover_emoji: coverEmoji,
        start_date: startDate,
        end_date: endDate,
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }

    const syncResult = await syncTripDays(tripId, startDate, endDate, jwt);
    if (!syncResult.ok) {
      return NextResponse.json(
        { ok: false, error: syncResult.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, days: syncResult.days });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `儲存失敗：${msg}` },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
    }

    const { tripId } = await params;

    const probe = await pgrest<{ is_public_sample: boolean }[]>({
      method: "GET",
      path: `/rest/v1/trips?id=eq.${tripId}&select=is_public_sample`,
      jwt,
    });
    if (probe.ok && probe.data?.[0]?.is_public_sample) {
      return NextResponse.json(
        { ok: false, error: "範例行程無法刪除" },
        { status: 403 },
      );
    }

    const result = await pgrest({
      method: "DELETE",
      path: `/rest/v1/trips?id=eq.${tripId}`,
      jwt,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `刪除失敗：${msg}` },
      { status: 500 },
    );
  }
}
