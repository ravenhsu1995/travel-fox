import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-travel-user-id");
  requestHeaders.delete("x-travel-user-email");

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getClaims() validates the JWT and is the right call for auth
  // gating on the proxy boundary. Do not use getSession() here.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const isAuthed = !!claims;

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/trips") && !pathname.startsWith("/trips/sample");

  if (!isAuthed && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (claims?.sub) {
    requestHeaders.set("x-travel-user-id", claims.sub);
  }

  const email = claims?.email;
  if (typeof email === "string") {
    requestHeaders.set("x-travel-user-email", email);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
