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

  // In your auth session listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user?.user_metadata?.invite_code) {
      const inviteCode = session.user.user_metadata.invite_code;

      await supabase
        .from("invites")
        .update({ accepted: true })
        .eq("invite_code", inviteCode);
    }
  });

  useEffect(() => {
    const checkInvite = async () => {
      if (!inviteCode) return;

      const { data, error } = await supabase
        .from("invites")
        .select("email, role")
        .eq("invite_code", inviteCode)
        .eq("accepted", false)
        .single();

      if (error || !data) {
        alert("Invalid or already used invite code.");
        return;
      }

      setFormData((prev) => ({ ...prev, email: data.email }));
      setInviteRole(data.role);
      setInviteValid(true);
    };

    checkInvite();
  }, [inviteCode]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteValid || !inviteCode || !inviteRole) {
      alert("Invalid invite. Please check your invitation link.");
      return;
    }

    const { email, password, fname, lname } = formData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: fname,
          last_name: lname,
          role: inviteRole,
          invite_code: inviteCode, // ✅ use the declared variable
        },
      },
    });

    if (error) {
      alert("Sign-up failed: " + error.message);
      return;
    }

    // Mark the invite as accepted
    await supabase
      .from("invites")
      .update({ accepted: true })
      .eq("invite_code", inviteCode);

    alert("Check your email to confirm your account.");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
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
  );
}
