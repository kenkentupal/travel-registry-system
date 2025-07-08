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

      // Check if the user already has a profile
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existing) {
        console.log("User profile already exists, skipping sync");
        return;
      }

      // Fetch invite using user email, handle multiple results
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

      if (inviteData.length > 1) {
        console.warn(
          "Multiple accepted invites found for user",
          user.email,
          "using the first one."
        );
      }

      // Use the first invite if there are multiple
      const invite = inviteData[0];

      console.log("Invite found, creating profile for user", user.email);

      // Insert profile data from invite
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
  }, [session]);
}
