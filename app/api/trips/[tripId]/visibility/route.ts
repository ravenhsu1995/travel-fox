import { NextResponse } from "next/server";
import { getAccessToken, pgrest } from "@/lib/supabase/rest";

type Body = {
  visibility?: unknown;
  public_display_name?: unknown;
};

const ALLOWED = new Set(["private", "unlisted", "public"]);

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

  if (typeof body.visibility !== "string" || !ALLOWED.has(body.visibility)) {
    return NextResponse.json(
      { ok: false, error: "visibility must be private / unlisted / public" },
      { status: 400 },
    );
  }
  const displayName =
    typeof body.public_display_name === "string"
      ? body.public_display_name
      : null;

  const result = await pgrest<{
    visibility: "private" | "unlisted" | "public";
    share_token: string | null;
    public_display_name: string | null;
  }>({
    method: "POST",
    path: "/rest/v1/rpc/update_trip_visibility",
    jwt,
    body: {
      p_trip_id: tripId,
      p_visibility: body.visibility,
      p_public_display_name: displayName,
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, ...result.data });
}
