import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import type { HotelInfo, TimelineItem } from "@/lib/types";

type DerivedExcludedBody = {
  dayId?: unknown;
  kind?: unknown;
  index?: unknown;
  excluded?: unknown;
};

type DayRow = {
  hotel: HotelInfo | null;
  timeline: TimelineItem[] | null;
};

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
    const body = (await request.json()) as DerivedExcludedBody;

    const dayId = typeof body.dayId === "string" ? body.dayId : "";
    const kind = body.kind === "hotel" || body.kind === "timeline" ? body.kind : null;
    const excluded = typeof body.excluded === "boolean" ? body.excluded : null;

    if (!dayId) {
      return NextResponse.json(
        { ok: false, error: "缺少 dayId" },
        { status: 400 },
      );
    }
    if (kind === null) {
      return NextResponse.json(
        { ok: false, error: "kind 必須為 hotel 或 timeline" },
        { status: 400 },
      );
    }
    if (excluded === null) {
      return NextResponse.json(
        { ok: false, error: "excluded 必須是布林值" },
        { status: 400 },
      );
    }

    const fetchResult = await pgrest<DayRow[]>({
      method: "GET",
      path: `/rest/v1/days?select=hotel,timeline&id=eq.${dayId}&trip_id=eq.${tripId}`,
      jwt,
    });
    if (!fetchResult.ok) {
      return NextResponse.json(
        { ok: false, error: fetchResult.error },
        { status: 400 },
      );
    }
    const day = fetchResult.data?.[0];
    if (!day) {
      return NextResponse.json(
        { ok: false, error: "找不到日程" },
        { status: 404 },
      );
    }

    let patch: { hotel?: HotelInfo | null; timeline?: TimelineItem[] };
    if (kind === "hotel") {
      if (!day.hotel) {
        return NextResponse.json(
          { ok: false, error: "這天沒有住宿資料" },
          { status: 400 },
        );
      }
      patch = { hotel: { ...day.hotel, excluded } };
    } else {
      const index = typeof body.index === "number" ? body.index : -1;
      const timeline = day.timeline ?? [];
      if (!Number.isInteger(index) || index < 0 || index >= timeline.length) {
        return NextResponse.json(
          { ok: false, error: "找不到該行程項目" },
          { status: 400 },
        );
      }
      const next = timeline.slice();
      next[index] = { ...next[index], excluded };
      patch = { timeline: next };
    }

    const updateResult = await pgrest({
      method: "PATCH",
      path: `/rest/v1/days?id=eq.${dayId}&trip_id=eq.${tripId}`,
      jwt,
      body: patch,
    });

    if (!updateResult.ok) {
      return NextResponse.json(
        { ok: false, error: updateResult.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `儲存失敗：${msg}` },
      { status: 500 },
    );
  }
}
