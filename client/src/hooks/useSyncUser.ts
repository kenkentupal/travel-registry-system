import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useSyncUser(session: any) {
  useEffect(() => {
    const syncProfileFromInvite = async () => {
      const user = session?.user;

      if (!user?.email_confirmed_at) {
        console.log("Email not confirmed, skipping profile sync");
        return;
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existing) {
        return;
      }

      const { data: inviteData, error: inviteError } = await supabase
        .from("invites")
        .select("*")
        .eq("email", user.email)
        .eq("accepted", true);

      if (inviteError) {
        console.error("Error fetching invite:", inviteError.message);
        return;
      }

      if (!inviteData || inviteData.length === 0) {
        console.log("No accepted invite found for user", user.email);
        return;
      }

      const invite = inviteData[0];

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
        console.log("✅ Synced profile from invite for user:", user.email);
      }
    };

    if (session?.user) {
      syncProfileFromInvite(); // ✅ Now the function is called
    }
  }, [session]);
}
