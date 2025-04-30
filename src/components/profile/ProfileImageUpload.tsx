import { useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import Button from "../common/Button";

interface ProfileImageUploadProps {
  currentImageUrl: string | null;
  onUpload: (url: string) => void;
}

export default function ProfileImageUpload({
  currentImageUrl,
  onUpload,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract file path from URL
      const filePath = currentImageUrl.split("/").pop();
      if (!filePath) return;

      await supabase.storage
        .from("avatars")
        .remove([`profile-images/${filePath}`]);

      onUpload("");
    } catch (error) {
      console.error("Error removing image:", error);
      setError("Failed to remove image");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Upload size={24} className="text-gray-400" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="relative">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload size={16} />}
              isLoading={isUploading}
            >
              Upload Image
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>

          {currentImageUrl && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<X size={16} />}
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Recommended: Square image, at least 400x400px
      </p>
    </div>
  );
}
