"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function TestConversationalFlowPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMockAssessment = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Create assessment directly using a simple API call
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: "Test Child for Conversational Flow",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create assessment");
      }

      const data = await response.json();
      
      // Now mark it as conversational and completed (you'll need to add this endpoint or use database directly)
      // For now, just get the ID
      setAssessmentId(data.id);
      
      alert(`Assessment created! ID: ${data.id}\n\nNow you need to:\n1. Mark it as conversational in the database\n2. Add completedAt date\n3. Then you can test the $9 upgrade`);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🐛 Test Conversational Flow</CardTitle>
            <CardDescription>
              Complete testing guide for the $9 enhanced report upgrade flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Quick Test Instructions:
              </h3>
              <ol className="text-sm space-y-2 text-yellow-800 dark:text-yellow-200">
                <li><strong>Step 1:</strong> Click the green "Create Real Mock" button on the dashboard widget</li>
                <li><strong>Step 2:</strong> It will create a conversational assessment in the database</li>
                <li><strong>Step 3:</strong> The upsell screen will appear with a real assessment ID</li>
                <li><strong>Step 4:</strong> Click "Unlock Enhanced Report – $9"</li>
                <li><strong>Step 5:</strong> Complete Stripe checkout (use test card: 4242 4242 4242 4242)</li>
                <li><strong>Step 6:</strong> Webhook will mark hasEnhancedReport = true</li>
                <li><strong>Step 7:</strong> Dashboard widget shows "Enhanced Report Active ✅"</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Manual Test (if needed):</h3>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  1. Create a basic assessment first:
                </p>
                <Button 
                  onClick={createMockAssessment} 
                  disabled={isCreating}
                  variant="outline"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Basic Assessment"
                  )}
                </Button>
              </div>

              {assessmentId && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      Assessment Created!
                    </span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    ID: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{assessmentId}</code>
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Now run this in your database to make it conversational:
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`UPDATE "Assessment"
SET "isConversational" = true,
    "status" = 'COMPLETED',
    "completedAt" = NOW()
WHERE "id" = '${assessmentId}';`}
                  </pre>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Error: {error}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Expected Flow:</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Dashboard shows "Try Conversational Mode" widget</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Click "Start Free Trial" → Chat dialog opens</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Click "Create Real Mock" → Creates DB record</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Upsell shows with $9 pricing and benefits</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Click "Unlock Enhanced Report" → Goes to Stripe</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Complete payment → Webhook processes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Dashboard widget shows "Enhanced Report Active ✅"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Click "View Enhanced Report" → See comparison</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => router.push("/")} 
              variant="outline"
              className="w-full"
            >
              ← Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
