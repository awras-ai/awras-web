"use client";

import { useState } from "react";
import { Camera, User, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRegistration } from "../../signup/components/RegistrationContext";
import { useUploadProfile } from "@/hooks/useAuth";

interface Step3FormProps {
  onComplete: () => void;
}

export function Step3Form({ onComplete }: Step3FormProps) {
  const { data, setData } = useRegistration();
  const [preview, setPreview] = useState<string | null>(
    data.profilePicture || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const mutation = useUploadProfile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      mutation.mutate(
        { file: selectedFile, userId: "user_" + Date.now() },
        {
          onSuccess: (result) => {
            setData({ profilePicture: result.url });
            onComplete();
          },
        },
      );
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Add a profile picture (optional)
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div
          className="relative overflow-hidden rounded-full border-4 border-border"
          style={{
            width: "150px",
            height: "150px",
          }}
        >
          <Avatar
            className="w-full h-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <AvatarImage
              src={preview || ""}
              alt="Profile preview"
              className="object-cover"
            />
            <AvatarFallback className="text-4xl">
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" type="button" asChild>
            <span>
              <Camera className="mr-2 h-4 w-4" />
              {preview ? "Change Photo" : "Upload Photo"}
            </span>
          </Button>
        </label>

        {preview && (
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : preview ? (
          "Confirm & Continue"
        ) : (
          "Skip for now"
        )}
      </Button>

      {mutation.isError && (
        <p className="text-sm text-red-500 text-center">
          {mutation.error.message}
        </p>
      )}
    </div>
  );
}
