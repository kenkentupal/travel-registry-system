import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useSyncUser(session: any) {
  useEffect(() => {
    const syncProfileFromInvite = async () => {
      const user = session?.user;

      if (!user?.id || !user?.email_confirmed_at) {
        console.log("User not confirmed or missing ID, skipping sync.");
        return;
      }

      // Check if profile already exists
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existing) return;

      // Get accepted invite
      const { data: invite, error: inviteError } = await supabase
        .from("invites")
        .select("position, organization_id")
        .eq("email", user.email)
        .eq("accepted", true)
        .single();

      if (inviteError || !invite) {
        console.log("No valid invite found for:", user.email);
        return;
      }

      // Insert profile
      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email: user.email,
          position: invite.position,
          organization_id: invite.organization_id,
        },
      ]);

      if (error) {
        console.error("❌ Failed to sync profile:", error.message);
      } else {
        console.log("✅ Profile synced from invite:", user.email);
      }
    };

    if (session?.user) {
      syncProfileFromInvite();
    }
  }, [session]);
}
