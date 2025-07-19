import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

interface Profiles {
  id: string;
  email: string;
  position: string;
  organization_id: string;
  created_at: string;
  organizations?: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [organizationId, setOrganizationId] = useState("");
  const [position, setPosition] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserAndMeta = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      setUser(userData.user);
      setFirstName(userData.user.user_metadata?.first_name || "");
      setLastName(userData.user.user_metadata?.last_name || "");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const profilesRes = await fetch(`${VITE_API_URL}/api/profiles`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const profiles = await profilesRes.json();
      const profile = profiles.find(
        (p: Profiles) => p.email === userData.user.email
      );

      if (profile) {
        setPosition(profile.position || "");
        setOrganizationId(profile.organization_id || "");
      }

      const orgsRes = await fetch(`${VITE_API_URL}/api/organizations`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const orgsData = await orgsRes.json();
      setOrganizations(orgsData);
      setOrganizations(orgsData);

      if (profile) {
        setPosition(profile.position || "");
        setOrganizationId(profile.organization_id || "");
        setProfileImageUrl(profile.avatar_url || ""); // assuming avatar_url in DB
      }
    };

    fetchUserAndMeta();
  }, []);

  const handleSave = async () => {
    try {
      if (!profileImage) {
        console.warn("No file selected.");
        return;
      }

      if (!user) {
        console.error("User not loaded.");
        return;
      }

      const fileExt = profileImage.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading image to Supabase...");

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, profileImage, {
          upsert: true,
          contentType: profileImage.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return;
      }

      console.log("Upload success:", uploadData);

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const uploadedImageUrl = publicUrlData.publicUrl;
      console.log("Public URL:", uploadedImageUrl);

      // Update avatar_url in profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: uploadedImageUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError.message);
        return;
      }

      setProfileImageUrl(uploadedImageUrl);
      console.log("✅ Profile updated.");
      closeModal();
    } catch (err: any) {
      console.error("❌ Failed to upload image:", err.message);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={
                  profileImageUrl ||
                  "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg"
                }
                alt="user"
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
                  {organizations.find((org) => org.id === organizationId)
                    ?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
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
            onSubmit={() => {
              handleSave(); // call your upload function
            }}
          >
            <div className="col-span-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden border rounded-full bg-gray-100 dark:bg-gray-800">
                  <img
                    src={
                      profileImage
                        ? URL.createObjectURL(profileImage)
                        : profileImageUrl ||
                          "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg"
                    }
                    alt="Profile Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
                <label className="relative flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Click or drag to upload
                  </span>
                  <input
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
                <Label>First Name</Label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Position</Label>
                <Input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Organization</Label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="border px-4 py-2 rounded-md w-full dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  <option value="">Select organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" type="button" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
