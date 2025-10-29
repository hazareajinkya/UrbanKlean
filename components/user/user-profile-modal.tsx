"use client";
import { useUserActions } from "@/lib/hooks/user/use-user-actions";
import { IUser } from "@/lib/types/user";
import { useEffect, useRef, useState } from "react";
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
      <div className="space-y-6">
        <div className="">
          <div className="flex items-center justify-between ">
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
          <p className="text-sm text-muted-foreground max-w-[80%]">
            Update your profile picture and personal information
          </p>
        </div>
        {user && <UserProfileForm user={user} onClose={onClose} />}
      </div>
    </Modal>
  );
}

const UserProfileForm = ({
  user,
  onClose,
}: {
  user: IUser;
  onClose: () => void;
}) => {
  const { updateProfile } = useUserActions();
  const [name, setName] = useState(user.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name ?? "");
    setFile(null);
    setPreviewUrl(undefined);
  }, []);

  const handleChooseFile = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ name, file: file ?? undefined });
    onClose();
  };
  const isLoading = updateProfile.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex gap-2 pt-4 items-center flex-col justify-center">
          <Avatar
            className={`size-24 ring-2 ring-border shrink-0 relative group cursor-pointer ${
              isLoading && "cursor-not-allowed"
            }`}
            onClick={() => !isLoading && handleChooseFile()}
          >
            <div
              className={` h-12 w-24 bottom-0 text-white absolute flex justify-center items-center transition-opacity duration-200 opacity-0 ${
                isLoading
                  ? "cursor-not-allowed"
                  : "group-hover:bg-black/50 group-hover:opacity-100 "
              }`}
            >
              <div className="flex flex-col items-center ">
                <Camera />
              </div>
            </div>
            <AvatarImage src={previewUrl || user.photoUrl} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-between text-sm gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="">
            <Button
              type="button"
              size={"sm"}
              variant="outline"
              disabled={isLoading}
              onClick={() => !isLoading && handleChooseFile()}
              className=""
            >
              Change Photo
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Name<span className="text-destructive">*</span>
        </Label>
        <Input
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="h-9 bg-muted/50 cursor-not-allowed"
        />
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
          Save Changes
        </Button>
      </div>
    </form>
  );
};
