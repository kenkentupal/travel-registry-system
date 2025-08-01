import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useEffect, useState, useRef } from "react";
import { Session, supabase } from "../../supabaseClient";
import { useUser } from "../../hooks/useUser";
import Spinner from "../ui/spinner/Spinner"; // Adjust path if needed

interface Organization {
  id: string;
  name: string;
}

const defaultAvatar =
  "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, loading } = useUser();

  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.user_metadata?.first_name || "");
    setLastName(user.user_metadata?.last_name || "");
    setPosition(user.position || "");
    setOrganizationId(user.organization_id || "");
    setProfileImageUrl(user.avatar_url || "");
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      sessionRef.current = session;

      const res = await fetch(`${VITE_API_URL}/api/organizations`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await res.json();
      setOrganizations(data);
    };

    fetchData();
  }, []);
  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(profileImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max 5MB.");
      return;
    }

    setProfileImage(file);
  };

  const uploadImageAndGetUrl = async () => {
    if (!profileImage || !user) return profileImageUrl;

    const ext = profileImage.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${user.id}.${ext}`;
    const fileType = profileImage.type;

    let oldFilePath: string | null = null;
    if (profileImageUrl.includes("/avatars/")) {
      const pathAndQuery = profileImageUrl.split("/avatars/")[1]?.split("?")[0];
      if (pathAndQuery) oldFilePath = `avatars/${pathAndQuery}`;
    }

    const res = await fetch(`${VITE_API_URL}/api/profiles/avatar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionRef.current?.access_token}`,
      },
      body: JSON.stringify({
        userId: user.id,
        fileName,
        fileType,
        oldFilePath,
        position,
        organizationId,
      }),
    });

    if (!res.ok) throw new Error("Failed to generate signed URL");

    const { signedUrl, publicUrl } = await res.json();

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileType,
      },
      body: profileImage,
    });

    if (!uploadRes.ok) throw new Error("Failed to upload avatar to storage");

    return `${publicUrl}?t=${Date.now()}`;
  };

  const updateUserMetadata = async () => {
    if (!user) return;

    const res = await fetch(`${VITE_API_URL}/api/profiles/update-metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionRef.current?.access_token}`,
      },
      body: JSON.stringify({
        userId: user.id,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!res.ok) throw new Error("Failed to update metadata");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const uploadedUrl = await uploadImageAndGetUrl();
      setProfileImageUrl(uploadedUrl);

      await updateUserMetadata();

      closeModal();
      window.location.reload();
    } catch (err: any) {
      console.error("Error saving:", err.message);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return <Spinner />;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={
                  profileImageUrl
                    ? profileImageUrl + `?t=${Date.now()}`
                    : defaultAvatar
                }
                alt="User Profile Picture"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {firstName} {lastName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {position}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.organizations?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            aria-label="Edit profile information"
          >
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {error && (
              <p className="text-sm text-red-500 mb-4">Error: {error}</p>
            )}

            <div className="col-span-2 mb-6">
              <Label htmlFor="profile-image">Profile Picture</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden border rounded-full bg-gray-100 dark:bg-gray-800">
                  <img
                    src={
                      profileImage
                        ? previewUrl
                        : profileImageUrl
                        ? profileImageUrl + `?t=${Date.now()}`
                        : defaultAvatar
                    }
                    alt="Profile Preview"
                  />
                </div>
                <label className="relative flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Click or drag to upload
                  </span>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" type="submit" disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
