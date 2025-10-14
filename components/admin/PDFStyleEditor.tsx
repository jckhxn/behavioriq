"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function PDFStyleEditor() {
  const [css, setCss] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStyle() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/pdf-styles", {
          credentials: "include",
        });
        if (res.ok) {
          const styles = await res.json();
          if (Array.isArray(styles) && styles.length > 0) {
            setCss(styles[0].css || "");
            setPreviewHtml(generatePreviewHtml(styles[0].css || ""));
          } else {
            setCss("");
            setPreviewHtml(generatePreviewHtml(""));
          }
        } else {
          if (res.status === 401) {
            setErrorMsg(
              "Unauthorized — please sign in as a Super Admin to view PDF styles."
            );
          } else {
            try {
              const body = await res.json();
              setErrorMsg(
                `Error fetching PDF styles: ${body.error || JSON.stringify(body)}`
              );
            } catch (e) {
              setErrorMsg(`Error fetching PDF styles: status ${res.status}`);
            }
          }
          console.warn("PDF styles API returned non-OK", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch PDF styles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStyle();
  }, []);

  function generatePreviewHtml(cssText: string) {
    return `
      <div style="font-family: system-ui, sans-serif; padding: 20px;">
        <h1 style="color: #667eea;">PDF Style Preview</h1>
        <p>This shows the custom CSS that will be applied to PDF reports.</p>
        <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; white-space: pre-wrap;">${escapeHtml(
          cssText.substring(0, 200)
        )}${cssText.length > 200 ? "..." : ""}</pre>
      </div>
    `;
  }

  function escapeHtml(unsafe: string) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pdf-styles", {
        method: "POST",
        body: JSON.stringify({ css }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const style = await res.json();
        setPreviewHtml(generatePreviewHtml(style.css || css));
        alert("PDF style saved successfully!");
      } else {
        throw new Error("Failed to save PDF style");
      }
    } catch (error) {
      console.error("Failed to save PDF style:", error);
      alert("Failed to save PDF style. Check console for errors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF Style Editor</CardTitle>
        <CardDescription>Tailwind/CSS used for PDF generation</CardDescription>
      </CardHeader>
      <CardContent>
        <label className="block mb-2 font-semibold">Tailwind/CSS Styles</label>
        <Textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          className="mb-4 h-60 font-mono"
          placeholder="PDF CSS/Tailwind styles"
        />

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save & Preview"}
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Live Preview (HTML)</h3>
          <div className="border rounded p-4 max-h-[32rem] overflow-auto bg-white/5">
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading preview...
              </div>
            ) : errorMsg ? (
              <div className="text-sm text-destructive">{errorMsg}</div>
            ) : previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <div className="text-sm text-muted-foreground">
                No PDF style available. Save one or seed the database.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
