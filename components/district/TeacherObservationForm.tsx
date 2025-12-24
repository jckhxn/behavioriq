"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface TeacherObservationFormProps {
  studentId: string;
}

export function TeacherObservationForm({
  studentId,
}: TeacherObservationFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/teacher/student/${studentId}/observations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save observation");
      }

      setContent("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Enter your observation here... (e.g., student behavior, classroom interactions, notable incidents)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        disabled={loading}
      />

      <Alert>
        <AlertDescription className="text-sm">
          <strong>Privacy Notice:</strong> These observations are visible to
          district administrators and may be used in conjunction with screening
          data for professional follow-up.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!content.trim() || loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Observation
      </Button>
    </form>
  );
}
