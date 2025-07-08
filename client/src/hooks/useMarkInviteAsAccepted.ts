import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export const useMarkInviteAsAccepted = (session: any) => {
  useEffect(() => {
    if (session && session.user?.email_confirmed_at) {
      const inviteCode = session.user.user_metadata?.invite_code;
      if (inviteCode) {
        const markInviteAsAccepted = async () => {
          const { error } = await supabase
            .from("invites")
            .update({ accepted: true })
            .eq("invite_code", inviteCode)
            .eq("accepted", false);

          if (error) {
            console.error("Invite update failed:", error.message);
          } else {
            console.log("✅ Invite marked as accepted");
          }
        };
        markInviteAsAccepted();
      }
    }
  }, [session]); // Trigger when session changes
};
