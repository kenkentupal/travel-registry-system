import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function AccountConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");

  // Check if tokens are available
  useEffect(() => {
    const handleSession = async () => {
      if (accessToken && refreshToken) {
        try {
          // Set session with the tokens
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // Store session in localStorage for persistence
          localStorage.setItem(
            "supabase_session",
            JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
          );

          // Redirect to sign-in page or dashboard after successful confirmation
          navigate("/dashboard"); // or wherever you want to navigate after confirmation
        } catch (error) {
          setError("Failed to log in after confirmation.");
        }
      } else {
        setError("Invalid confirmation link.");
      }
    };

    handleSession();
  }, [accessToken, refreshToken, navigate]);

  return (
    <div>
      <h2>Your account has been successfully confirmed!</h2>
      {error && <p>{error}</p>}
      {/* Optional: Add a button to navigate back to login */}
      <button onClick={() => navigate("/signin")}>Go to Sign In</button>
    </div>
  );
}
