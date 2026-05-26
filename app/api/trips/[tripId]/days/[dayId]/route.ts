import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import { CURRENCIES } from "@/lib/currency";

type SaveDayBody = {
  theme: unknown;
  hotel: unknown;
  timeline: unknown;
};

const ALLOWED_CURRENCIES = new Set<string>(CURRENCIES);

function validateCostShape(
  raw: unknown,
  where: string,
): string | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { costAmount?: unknown; costCurrency?: unknown };
  const hasAmount =
    typeof r.costAmount === "number" && Number.isFinite(r.costAmount) && r.costAmount > 0;
  const currency = r.costCurrency;
  if (hasAmount) {
    if (typeof currency !== "string" || !ALLOWED_CURRENCIES.has(currency)) {
      return `${where}: cost amount present but currency missing or invalid`;
    }
  }
  if (
    currency !== undefined &&
    currency !== null &&
    (typeof currency !== "string" || !ALLOWED_CURRENCIES.has(currency as string))
  ) {
    return `${where}: invalid currency`;
  }
  return null;
}

function validatePayload(body: SaveDayBody): string | null {
  if (body.hotel && typeof body.hotel === "object") {
    const err = validateCostShape(body.hotel, "hotel");
    if (err) return err;
  }
  if (Array.isArray(body.timeline)) {
    for (let i = 0; i < body.timeline.length; i++) {
      const it = body.timeline[i] as Record<string, unknown>;
      const prefix = `timeline[${i}]`;
      const err =
        validateCostShape(it.transport, `${prefix}.transport`) ||
        validateCostShape(it.meal, `${prefix}.meal`) ||
        validateCostShape(it.exp, `${prefix}.exp`);
      if (err) return err;
    }
  }
  return null;
}

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

    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json(
        { ok: false, error: validationError },
        { status: 400 },
      );
    }

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> },
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
    }

    const { tripId, dayId } = await params;
    const result = await pgrest({
      method: "DELETE",
      path: `/rest/v1/days?id=eq.${dayId}&trip_id=eq.${tripId}`,
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
