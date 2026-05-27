import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import { CURRENCIES } from "@/lib/currency";

const ALLOWED_CURRENCIES = new Set<string>(CURRENCIES);

type PatchExpenseBody = {
  description?: unknown;
  amount?: unknown;
  currency?: unknown;
  category?: unknown;
  date?: unknown;
  excluded?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> },
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
    }

    const { tripId, expenseId } = await params;
    const body = (await request.json()) as PatchExpenseBody;

    const patch: Record<string, unknown> = {};

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return NextResponse.json(
          { ok: false, error: "描述無效" },
          { status: 400 },
        );
      }
      patch.description = body.description.trim();
    }
    if (body.amount !== undefined) {
      if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
        return NextResponse.json(
          { ok: false, error: "金額需為正數" },
          { status: 400 },
        );
      }
      patch.amount = body.amount;
    }
    if (body.currency !== undefined) {
      if (typeof body.currency !== "string" || !ALLOWED_CURRENCIES.has(body.currency)) {
        return NextResponse.json(
          { ok: false, error: "幣別無效" },
          { status: 400 },
        );
      }
      patch.currency = body.currency;
    }
    if (body.category !== undefined) {
      if (typeof body.category !== "string" || !body.category) {
        return NextResponse.json(
          { ok: false, error: "類別無效" },
          { status: 400 },
        );
      }
      patch.category = body.category;
    }
    if (body.date !== undefined) {
      if (typeof body.date !== "string" || !body.date) {
        return NextResponse.json(
          { ok: false, error: "日期無效" },
          { status: 400 },
        );
      }
      patch.date = body.date;
    }
    if (body.excluded !== undefined) {
      if (typeof body.excluded !== "boolean") {
        return NextResponse.json(
          { ok: false, error: "excluded 必須是布林值" },
          { status: 400 },
        );
      }
      patch.excluded = body.excluded;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { ok: false, error: "沒有要更新的欄位" },
        { status: 400 },
      );
    }

    const result = await pgrest({
      method: "PATCH",
      path: `/rest/v1/expenses?id=eq.${expenseId}&trip_id=eq.${tripId}`,
      jwt,
      body: patch,
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
  { params }: { params: Promise<{ tripId: string; expenseId: string }> },
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "未登入" }, { status: 401 });
    }

    const { tripId, expenseId } = await params;
    const result = await pgrest({
      method: "DELETE",
      path: `/rest/v1/expenses?id=eq.${expenseId}&trip_id=eq.${tripId}`,
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
