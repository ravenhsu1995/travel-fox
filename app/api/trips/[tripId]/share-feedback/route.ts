import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";

type Body = {
  share_show_feedback?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const { tripId } = await params;
  const jwt = await getAccessToken();
  if (!jwt) {
    return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (typeof body.share_show_feedback !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "share_show_feedback must be boolean" },
      { status: 400 },
    );
  }

  // RLS on trips restricts UPDATE to the owner. A non-owner request would
  // affect zero rows yet still return 200 — we use returnRow to count the
  // affected rows ourselves and surface a real 404 when nothing matched,
  // so callers can distinguish "saved" from "silently ignored".
  const result = await pgrest<Array<{ id: string }>>({
    method: "PATCH",
    path: `/rest/v1/trips?id=eq.${tripId}&select=id`,
    jwt,
    body: { share_show_feedback: body.share_show_feedback },
    returnRow: true,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }
  if (!Array.isArray(result.data) || result.data.length === 0) {
    return NextResponse.json(
      { ok: false, error: "trip not found or no permission" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
