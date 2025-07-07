import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const code = searchParams.get("code");

  useEffect(() => {
    const validateInvite = async () => {
      if (!code) {
        setError("Missing invite code.");
        setValidating(false);
        return;
      }

      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("invite_code", code)
        .single();

      if (error || !data) {
        setError("Invalid or expired invite.");
      } else {
        // Example: redirect to sign-up and include invite code
        navigate(`/signup?code=${code}`);
      }

      setValidating(false);
    };

    validateInvite();
  }, [code]);

  if (validating) return <p className="p-4">Checking your invite...</p>;

  return <div className="p-4 text-red-600">{error && <p>{error}</p>}</div>;
}
