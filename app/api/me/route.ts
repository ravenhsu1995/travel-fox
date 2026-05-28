import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  return NextResponse.json(
    {
      isAuthed: !!claims,
      email: (claims?.email as string | undefined) ?? null,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
