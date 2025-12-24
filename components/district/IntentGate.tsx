"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield } from "lucide-react";

interface IntentGateProps {
  studentId: string;
  action:
    | "VIEW_STUDENT_DETAIL"
    | "VIEW_SCREENING_SUMMARY"
    | "VIEW_OBSERVATIONS";
  children: React.ReactNode;
}

export function IntentGate({ studentId, action, children }: IntentGateProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAcknowledge = async () => {
    if (!accepted) return;

    setLoading(true);
    try {
      // Log the acknowledgment
      await fetch("/api/intent/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          action,
        }),
      });

      setAcknowledged(true);
    } catch (error) {
      console.error("Failed to log acknowledgment:", error);
      // Still allow access even if logging fails
      setAcknowledged(true);
    } finally {
      setLoading(false);
    }
  };

  if (acknowledged) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Privacy & Compliance Notice</CardTitle>
          </div>
          <CardDescription>
            You are about to access student screening data. Please review and
            acknowledge the following.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>This is NOT a diagnostic tool.</strong>
              <br />
              The information you are about to view represents early warning
              indicators only.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Important Disclaimers:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Not a diagnosis:</strong> This screening does not
                diagnose any medical or mental health condition.
              </li>
              <li>
                <strong>Requires professional follow-up:</strong> Flagged
                indicators suggest a need for further evaluation by qualified
                professionals.
              </li>
              <li>
                <strong>FERPA compliance:</strong> Student data is protected.
                Access is logged and monitored.
              </li>
              <li>
                <strong>No comparative ranking:</strong> Do not compare students
                or use this data for punitive purposes.
              </li>
              <li>
                <strong>Human-in-the-loop required:</strong> All insights
                require human judgment and context.
              </li>
            </ul>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Your access to this data is being logged</strong> in
              compliance with district policy and federal regulations (FERPA).
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="acknowledge"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <Label
              htmlFor="acknowledge"
              className="text-sm font-normal cursor-pointer"
            >
              I understand that this is screening data only, not a diagnosis,
              and I will use it responsibly in accordance with district policy
              and FERPA regulations.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleAcknowledge} disabled={!accepted || loading}>
            {loading ? "Logging access..." : "I Acknowledge - Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
