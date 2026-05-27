import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import { CURRENCIES } from "@/lib/currency";

const ALLOWED_CURRENCIES = new Set<string>(CURRENCIES);

type AddExpenseBody = {
  description?: unknown;
  amount?: unknown;
  currency?: unknown;
  category?: unknown;
  date?: unknown;
};

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
    const body = (await request.json()) as AddExpenseBody;

    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const amount = typeof body.amount === "number" ? body.amount : NaN;
    const currency =
      typeof body.currency === "string" ? body.currency : "";
    const category = typeof body.category === "string" ? body.category : "";
    const date = typeof body.date === "string" ? body.date : "";

    if (!description) {
      return NextResponse.json(
        { ok: false, error: "請輸入描述" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: "金額需為正數" },
        { status: 400 },
      );
    }
    if (!ALLOWED_CURRENCIES.has(currency)) {
      return NextResponse.json(
        { ok: false, error: "幣別無效" },
        { status: 400 },
      );
    }
    if (!category) {
      return NextResponse.json(
        { ok: false, error: "請選擇類別" },
        { status: 400 },
      );
    }
    if (!date) {
      return NextResponse.json(
        { ok: false, error: "請選擇日期" },
        { status: 400 },
      );
    }

    const result = await pgrest({
      method: "POST",
      path: "/rest/v1/expenses",
      jwt,
      body: {
        trip_id: tripId,
        description,
        amount,
        currency,
        category,
        date,
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
      { ok: false, error: `新增失敗：${msg}` },
      { status: 500 },
    );
  }
}
