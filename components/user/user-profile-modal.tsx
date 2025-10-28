"use client";
import { useUserActions } from "@/lib/hooks/auth/use-user-actions";
import { IUser } from "@/lib/types/user";
import { useEffect, useRef, useState, memo } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | undefined;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
}: UserProfileModalProps) {
  return (
    <Modal isOpen={isOpen} closeModal={onClose} size="md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Profile Information</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="size-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {user && <UserProfileForm user={user} onClose={onClose} />}
    </Modal>
  );
}

const UserProfileForm = memo(function UserProfileForm({
  user,
  onClose,
}: {
  user: IUser;
  onClose: () => void;
}) {
  const { updateProfile } = useUserActions();
  const [name, setName] = useState(user.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name ?? "");
    setFile(null);
    setPreviewUrl(undefined);
  }, [user.name]);

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ name, file });
    onClose();
  };

  const isLoading = updateProfile.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Photo</Label>
        <div className="flex gap-6 items-center">
          <Avatar
            className="h-24 w-24 ring-2 ring-border shrink-0 relative"
            onClick={() => !isLoading && handleChooseFile()}
          >
            <div
              className={`w-24 h-12 bottom-0 text-white absolute flex justify-center items-center transition-opacity duration-200 opacity-0 ${
                isLoading
                  ? "cursor-not-allowed"
                  : "hover:bg-black/50 hover:opacity-100 cursor-pointer"
              }`}
            >
              <Camera />
            </div>
            <AvatarImage src={previewUrl || user.photoUrl} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-between text-sm gap-2">
            <Button
              type="button"
              disabled={isLoading}
              variant={"outline"}
              onClick={() => !isLoading && handleChooseFile()}
            >
              Update new photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-muted-foreground">
              Recommended: Square JPG/PNG, at least 1000px per side.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Name *</Label>
        <Input
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <h4 className="text-muted-foreground cursor-not-allowed">
          {user.email}
        </h4>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || name === ""}
          className="gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  );
});
