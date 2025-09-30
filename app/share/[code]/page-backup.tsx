"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SharedAssessmentPage() {
  const params = useParams();
  const code = params.code as string;

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect running, code:", code);
    // Force show dialog after 1 second for testing
    setTimeout(() => {
      console.log("Setting showPasswordDialog to true");
      setShowPasswordDialog(true);
      setLoading(false);
    }, 1000);
  }, [code]);

  const handlePasswordSubmit = () => {
    alert("Password submitted: " + password);
  };

  console.log("Component rendering, showPasswordDialog:", showPasswordDialog);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading shared assessment...
            </p>
            <p className="text-xs text-red-500 mt-2">
              DEBUG: showPasswordDialog = {String(showPasswordDialog)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Share Page Working!</h1>
        <p>Code: {code}</p>
        <p>Password Dialog: {String(showPasswordDialog)}</p>
      </div>

      {/* Password Modal */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Password Required</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This assessment is password protected. Please enter the password
              to view it.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePasswordSubmit}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
