/**
 * Minimal Supabase PostgREST helper using direct fetch.
 *
 * Bypasses the @supabase/ssr SDK in Server Actions to eliminate any
 * cookies().set(...) side-effects. Setting cookies inside a Server
 * Action triggers Next.js to re-render the current page; that re-render
 * has been the source of recurring "An error occurred in the Server
 * Components render" failures during save/mutate operations.
 *
 * Usage: read the user's JWT once at the top of an action, then pass it
 * to these helpers. The proxy (middleware) keeps the JWT fresh on each
 * request, so reading it here is enough.
 */
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Read the user's access_token JWT from the Supabase auth cookies.
 * Returns null if not authenticated.
 *
 * Supabase v2 stores session as JSON across `sb-<project-ref>-auth-token`
 * cookies. The cookie value is a base64-encoded JSON string starting
 * with "base64-".
 */
export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  const all = store.getAll();
  // Find the auth-token cookie (may be chunked: .0, .1, etc.)
  const authCookies = all
    .filter((c) => /sb-.*-auth-token(\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (authCookies.length === 0) return null;

  // Concatenate chunked cookies
  const raw = authCookies.map((c) => c.value).join("");
  const decoded = raw.startsWith("base64-")
    ? Buffer.from(raw.slice("base64-".length), "base64").toString("utf-8")
    : raw;

  try {
    const parsed = JSON.parse(decoded);
    return parsed?.access_token ?? null;
  } catch {
    return null;
  }
}

type RestOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string; // e.g. "/rest/v1/days?id=eq.xxx"
  body?: unknown;
  jwt: string;
  returnRow?: boolean; // include Prefer: return=representation
};

export async function pgrest<T = unknown>({
  method,
  path,
  body,
  jwt,
  returnRow,
}: RestOptions): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  };
  if (returnRow) headers["Prefer"] = "return=representation";

  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `${res.status} ${text || res.statusText}` };
  }

  // PostgREST returns empty body for 204 (PATCH/DELETE without Prefer) and
  // for 201 POST without Prefer: return=representation. Both must be treated
  // as success — calling res.json() on empty body throws SyntaxError.
  const text = await res.text();
  if (!text) return { ok: true, data: undefined as T };
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Invalid JSON response: ${msg}` };
  }
}
