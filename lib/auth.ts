import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type UserClaims = {
  sub: string;
  email?: string;
} & Record<string, unknown>;

export const getUserClaims = cache(async (): Promise<UserClaims | null> => {
  const headerStore = await headers();
  const proxiedUserId = headerStore.get("x-travel-user-id");

  if (proxiedUserId) {
    return {
      sub: proxiedUserId,
      email: headerStore.get("x-travel-user-email") ?? undefined,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims as UserClaims | undefined) ?? null;
});
