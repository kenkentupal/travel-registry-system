import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useSyncUser(session: any) {
  useEffect(() => {
    const syncProfileFromInvite = async () => {
      const user = session?.user;
      if (!user?.email_confirmed_at) return;

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existing) return;

      const { data: invite } = await supabase
        .from("invites")
        .select("*")
        .eq("email", user.email)
        .eq("accepted", true)
        .single();

      if (!invite) return;

      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email: user.email,
          position: invite.position,
          organization_id: invite.organization_id,
        },
      ]);

      if (error) {
        console.error("❌ Failed to create profile:", error.message);
      } else {
        console.log("✅ Synced profile from invite");
      }
    };

    if (session?.user) {
      syncProfileFromInvite();
    }
  }, [session]);
}
