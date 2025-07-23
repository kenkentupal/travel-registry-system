import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function AccountConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    const confirmAccount = async () => {
      if (!accessToken || !refreshToken) {
        setError("Invalid or expired confirmation link.");
        return;
      }

      try {
        // Let Supabase handle everything internally
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Optional: Wait briefly before navigating (helps session settle)
        setTimeout(() => navigate("/dashboard"), 500);
      } catch (err) {
        console.error(err);
        setError("Failed to complete account confirmation.");
      }
    };

    confirmAccount();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Account Confirmation</h2>
        {error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/signin")}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Go to Sign In
            </button>
          </>
        ) : (
          <p className="text-gray-700">
            Confirming your account, please wait...
          </p>
        )}
      </div>
    </div>
  );
}
