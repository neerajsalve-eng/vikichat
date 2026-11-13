import Modal from "../Modal";
import { FC, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../shared/firebase";
import { IMAGE_PROXY } from "../../shared/constants";
import { useStore } from "../../store";
import { toast } from "../../store/toast";

interface UserInfoProps {
  isOpened: boolean;
  setIsOpened: (value: boolean) => void;
}

const AVATAR_SEEDS = ["rhino", "tiger", "panda", "falcon", "wolf"];
const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;

const UserInfo: FC<UserInfoProps> = ({ isOpened, setIsOpened }) => {
  const currentUser = useStore((state) => state.currentUser);
  const [name, setName] = useState(currentUser?.displayName || "");
  const [photo, setPhoto] = useState(currentUser?.photoURL || "");
  const [saving, setSaving] = useState(false);

  if (!isOpened) return null;

  const handleSave = async () => {
    if (!currentUser) return;
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName: cleanName,
        photoURL: photo,
      });
      toast.info("Profile updated");
      setIsOpened(false);
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Your Profile" onClose={() => setIsOpened(false)}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <img
            className="h-16 w-16 rounded-full object-cover"
            src={photo.includes("dicebear") ? photo : IMAGE_PROXY(photo)}
            alt=""
          />
          <input
            className="flex-1 rounded bg-dark-lighten px-3 py-2 outline-none"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <p className="mt-4 mb-2 text-sm">Choose an avatar</p>
        <div className="flex gap-2">
          {AVATAR_SEEDS.map((seed) => (
            <img
              key={seed}
              src={avatarUrl(seed)}
              alt={seed}
              onClick={() => setPhoto(avatarUrl(seed))}
              className={`h-12 w-12 cursor-pointer rounded-full ${
                photo === avatarUrl(seed) ? "ring-2 ring-blue-500" : ""
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded bg-blue-500 py-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
};

export default UserInfo;