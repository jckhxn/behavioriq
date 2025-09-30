"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface BulkUploadResult {
  assessmentId: string;
  assessmentName: string;
  domainsCreated: number;
  domainsReused: number;
  totalDomains: number;
}

interface BulkUploadDialogProps {
  onUploadComplete?: () => void;
}

export function BulkUploadDialog({ onUploadComplete }: BulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".json")) {
        setError("Please select a JSON file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(30);

      const response = await fetch(
        "/api/admin/assessment-templates/bulk-upload",
        {
          method: "POST",
          body: formData,
        }
      );

      setProgress(60);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setResult(data);
      toast.success(
        `Assessment "${data.assessmentName}" uploaded successfully!`
      );

      // Call callback to refresh parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
      toast.error("Failed to upload assessment");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setError(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Package className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Assessment
          </DialogTitle>
          <DialogDescription>
            Upload a complete assessment with multiple domains in one JSON file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!result && (
            <>
              <div className="space-y-2">
                <Label htmlFor="file">Assessment JSON File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  Select a JSON file with complete assessment structure
                  including domains.
                </p>
              </div>

              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{file.name}</strong> (
                    {(file.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Upload Successful!</div>
                  <div className="text-sm space-y-1">
                    <div>
                      Assessment: <strong>{result.assessmentName}</strong>
                    </div>
                    <div>
                      Total Domains: <strong>{result.totalDomains}</strong>
                    </div>
                    <div>
                      New Domains Created:{" "}
                      <strong>{result.domainsCreated}</strong>
                    </div>
                    {result.domainsReused > 0 && (
                      <div>
                        Existing Domains Reused:{" "}
                        <strong>{result.domainsReused}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1"
              >
                {uploading ? "Uploading..." : "Upload Assessment"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
