import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // No-op: session/cookie refresh is handled by the proxy (middleware).
        // Writing cookies here from a Server Action triggers Next.js to
        // auto-re-render the current page and layouts (Next.js 16 docs:
        // "When you set or delete a cookie in a Server Action, Next.js
        // re-renders the current page and its layouts on the server so the
        // UI reflects the new cookie value"). That re-render can fail and
        // surface as "An error occurred in the Server Components render".
        setAll() {},
      },
    },
  );
}
