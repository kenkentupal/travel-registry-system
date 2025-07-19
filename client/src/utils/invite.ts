// utils/invite.ts
import { supabase } from "../supabaseClient";

export async function createInvite(email: string, role: string) {
  const code = crypto.randomUUID(); // or shortid
  const { error } = await supabase.from("invites").insert([
    {
      email,
      invite_code: code,
      role,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  ]);
  return { code, error };
}
