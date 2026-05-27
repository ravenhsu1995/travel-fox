import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import { normalizeJoinedLocationChips } from "@/lib/location-chips";

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

    return NextResponse.json({ ok: true });
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
