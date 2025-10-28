"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Upload, Trash2, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onAvatarChanged?: (url: string | null) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  userName = "User",
  onAvatarChanged,
}: AvatarUploadProps) {
  const [avatar, setAvatar] = useState<string | null | undefined>(currentAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only image files (JPEG, PNG, WebP, GIF) are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !fileInputRef.current?.files?.[0]) {
      setError("No file selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to upload avatar");
        setLoading(false);
        return;
      }

      setAvatar(data.avatarUrl);
      setSuccess(true);
      setPreview(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent component
      onAvatarChanged?.(data.avatarUrl);
    } catch (err) {
      setError("An error occurred while uploading");
      console.error("Avatar upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!avatar) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete avatar");
        setLoading(false);
        return;
      }

      setAvatar(null);
      setSuccess(true);
      setPreview(null);
      onAvatarChanged?.(null);
    } catch (err) {
      setError("An error occurred while deleting");
      console.error("Avatar delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>
          Upload or change your profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current or Preview Avatar */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : avatar ? (
              <Image
                src={avatar}
                alt={userName}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>

          {preview && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Preview
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Click Upload to confirm
              </p>
            </div>
          )}
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              {preview === null ? "Avatar updated successfully!" : "File selected. Click Upload to confirm."}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!preview ? (
            <>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full"
                variant="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </>
                )}
              </Button>

              {avatar && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Avatar
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Supported formats: JPEG, PNG, WebP, GIF</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Recommended size: 500x500 pixels or larger</p>
        </div>
      </CardContent>
    </Card>
  );
}
