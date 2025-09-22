"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

interface EmailReportButtonProps {
  assessmentId: string;
  defaultEmail?: string;
  className?: string;
}

export default function EmailReportButton({
  assessmentId,
  defaultEmail = "",
  className = "",
}: EmailReportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [includePdf, setIncludePdf] = useState(true);
  const [sending, setSending] = useState(false);

  const sendReport = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSending(true);

      const response = await fetch("/api/emails/assessment-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          recipientEmail: email,
          includePdf,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Assessment report sent to ${email}`);
        setDialogOpen(false);
        setEmail(defaultEmail);
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send assessment report");
      console.error("Email sending error:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Mail className="h-4 w-4 mr-2" />
          Email Report
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Assessment Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Recipient Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includePdf"
              checked={includePdf}
              onCheckedChange={(checked) => setIncludePdf(checked as boolean)}
              disabled={sending}
            />
            <Label htmlFor="includePdf">Include PDF report as attachment</Label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Email will include:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Executive summary of assessment results</li>
              <li>• Risk level determination</li>
              <li>• Key findings and recommendations</li>
              {includePdf && <li>• Detailed PDF report (attachment)</li>}
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button onClick={sendReport} disabled={sending || !email.trim()}>
              {sending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
