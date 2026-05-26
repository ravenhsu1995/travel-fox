import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import type { Day } from "@/lib/types";

type AddDayBody = {
  position?: unknown;
  relativeToDayId?: unknown;
};

type DaySeed = {
  id: string;
  date: string;
  sort_order: number;
};

function formatDate(date: Date) {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dy = String(date.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
}

function dayLabel(date: Date) {
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()} (${weekday})`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
    }

    const { tripId } = await params;
    const body = (await request.json()) as AddDayBody;
    const position = body.position === "before" ? "before" : "after";
    const relativeToDayId =
      typeof body.relativeToDayId === "string" ? body.relativeToDayId : "";

    const fetchResult = await pgrest<DaySeed[]>({
      method: "GET",
      path: `/rest/v1/days?select=id,date,sort_order&trip_id=eq.${tripId}&order=sort_order`,
      jwt,
    });
    if (!fetchResult.ok) {
      return NextResponse.json(
        { ok: false, error: fetchResult.error },
        { status: 400 },
      );
    }

    const allDays = fetchResult.data ?? [];
    const refDay = allDays.find((d) => d.id === relativeToDayId);
    if (!refDay && allDays.length > 0) {
      return NextResponse.json(
        { ok: false, error: "找不到參考日" },
        { status: 400 },
      );
    }

    const refDate = refDay
      ? new Date(`${refDay.date}T00:00:00`)
      : new Date();
    const newDate = new Date(refDate);
    newDate.setDate(newDate.getDate() + (position === "after" ? 1 : -1));
    const newDateStr = formatDate(newDate);

    if (allDays.some((d) => d.date === newDateStr)) {
      return NextResponse.json(
        { ok: false, error: `${newDateStr} 已存在，無法重複新增` },
        { status: 409 },
      );
    }

    const refSortOrder = refDay?.sort_order ?? (position === "after" ? -1 : 0);
    const newSortOrder =
      position === "after" ? refSortOrder + 1 : refSortOrder;
    const toShift = allDays.filter((d) =>
      position === "after"
        ? d.sort_order > refSortOrder
        : d.sort_order >= refSortOrder,
    );

    for (const day of toShift) {
      const shiftResult = await pgrest({
        method: "PATCH",
        path: `/rest/v1/days?id=eq.${day.id}`,
        jwt,
        body: { sort_order: day.sort_order + 1 },
      });
      if (!shiftResult.ok) {
        return NextResponse.json(
          { ok: false, error: shiftResult.error },
          { status: 400 },
        );
      }
    }

    const label = dayLabel(newDate);
    const insertResult = await pgrest<Array<{ id: string }>>({
      method: "POST",
      path: "/rest/v1/days?select=id",
      jwt,
      returnRow: true,
      body: {
        trip_id: tripId,
        date: newDateStr,
        day_label: label,
        theme: null,
        hotel: null,
        timeline: [],
        sort_order: newSortOrder,
      },
    });
    if (!insertResult.ok) {
      return NextResponse.json(
        { ok: false, error: insertResult.error },
        { status: 400 },
      );
    }

    const insertedId = insertResult.data?.[0]?.id;
    if (!insertedId) {
      return NextResponse.json(
        { ok: false, error: "新增成功但無法取得 ID" },
        { status: 500 },
      );
    }

    const day: Day = {
      id: insertedId,
      trip_id: tripId,
      date: newDateStr,
      day_label: label,
      theme: null,
      hotel: null,
      timeline: [],
      sort_order: newSortOrder,
    };

    return NextResponse.json({ ok: true, day });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `新增失敗：${msg}` },
      { status: 500 },
    );
  }
}
