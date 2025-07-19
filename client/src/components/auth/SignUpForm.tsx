import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import { EyeIcon, EyeCloseIcon, ChevronLeftIcon } from "../../icons";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("code");

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  const [inviteRole, setInviteRole] = useState<string | null>(null);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteInvalidMessage, setInviteInvalidMessage] = useState("");

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const session = localStorage.getItem("sb-gyhwdkhjyhbntjflqfwz-auth-token");

    if (session) {
      const parsedSession = JSON.parse(session);
      if (parsedSession?.access_token) {
        supabase.auth
          .setSession({
            access_token: parsedSession.access_token,
            refresh_token: parsedSession.refresh_token,
          })
          .then(() => {
            setShowLogoutPopup(true);
          })
          .catch((error) => console.error("Failed to set session", error));
      }
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const checkInvite = async () => {
      if (!inviteCode) return;

      const { data, error } = await supabase
        .from("invites")
        .select("email, role, expires_at, accepted")
        .eq("invite_code", inviteCode)
        .single();

      const now = new Date();
      const expired = data?.expires_at && new Date(data.expires_at) < now;

      if (error || !data || expired || data.accepted) {
        if (expired) {
          setInviteInvalidMessage("This invite has expired.");
        } else {
          setInviteInvalidMessage("Invalid or already used invite code.");
        }
        return;
      }

      setFormData((prev) => ({ ...prev, email: data.email }));
      setInviteRole(data.role);
      setInviteValid(true);
    };

    checkInvite();

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(() => {
          localStorage.setItem(
            "sb-gyhwdkhjyhbntjflqfwz-auth-token",
            JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
          );
          setShowConfirmationMessage(true);
        })
        .catch((error) => console.error("Session set error:", error));
    }
  }, [inviteCode]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password, fname, lname } = formData;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: fname,
          last_name: lname,
          role: inviteRole,
          invite_code: inviteCode,
        },
      },
    });

    if (error) {
      alert("Sign-up failed: " + error.message);
      return;
    }

    await supabase
      .from("invites")
      .update({ accepted: true })
      .eq("invite_code", inviteCode);

    alert("Check your email to confirm your account.");
  };

  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie =
        "supabase.auth.token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      setShowLogoutPopup(false);
    });
  };

  if (inviteInvalidMessage) {
    return (
      <div
        className={`flex flex-col flex-1 min-h-screen ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 py-10">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Invite Link Invalid
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {inviteInvalidMessage}
            </p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col flex-1 min-h-screen ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 py-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
          {showLogoutPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                <h3 className="text-lg font-semibold">
                  You're already logged in
                </h3>
                <p className="text-sm mb-4">
                  Do you want to log out and proceed with sign up?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowLogoutPopup(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {showConfirmationMessage && (
            <div className="bg-green-200 p-4 rounded-md mb-6 text-center text-green-800">
              <p>
                Your account has been confirmed! Please sign in to continue.
              </p>
              <Link to="/login" className="text-blue-600">
                Sign In
              </Link>
            </div>
          )}

          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm mb-4 inline-block"
          >
            <ChevronLeftIcon className="inline size-4 mr-1" />
            Back to dashboard
          </Link>

          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Sign Up
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Create an account with your invite link.
          </p>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  placeholder="Juan"
                  value={formData.fname}
                  onChange={(e) =>
                    setFormData({ ...formData, fname: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  placeholder="Dela Cruz"
                  value={formData.lname}
                  onChange={(e) =>
                    setFormData({ ...formData, lname: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                disabled
                value={formData.email}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Create a secure password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                By signing up, you agree to our <strong>Terms</strong> and{" "}
                <strong>Privacy Policy</strong>.
              </span>
            </div>

            <button
              type="submit"
              disabled={!isChecked || !inviteValid}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
