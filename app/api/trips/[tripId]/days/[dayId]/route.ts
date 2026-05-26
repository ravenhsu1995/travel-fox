import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";

type SaveDayBody = {
  theme: unknown;
  hotel: unknown;
  timeline: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> },
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
    }

    const { tripId, dayId } = await params;
    const body = (await request.json()) as SaveDayBody;

    const result = await pgrest({
      method: "PATCH",
      path: `/rest/v1/days?id=eq.${dayId}&trip_id=eq.${tripId}`,
      jwt,
      body: {
        theme: typeof body.theme === "string" ? body.theme : null,
        hotel: body.hotel ?? null,
        timeline: Array.isArray(body.timeline) ? body.timeline : [],
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
