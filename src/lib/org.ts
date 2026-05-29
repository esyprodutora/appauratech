import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  session_quota: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Returns the organization the current user belongs to (via RLS), creating
 * one with default 'starter' plan if it doesn't exist yet.
 */
export async function ensureOrganization(user: User): Promise<Organization> {
  const { data: existing, error: selErr } = await supabase
    .from("organizations")
    .select("*")
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing as Organization;

  const { data: created, error: insErr } = await supabase
    .from("organizations")
    .insert({
      name: user.email ?? "Minha Organização",
      slug: user.id,
      plan: "starter",
      session_quota: 50000,
    })
    .select("*")
    .single();
  if (insErr) throw insErr;
  return created as Organization;
}