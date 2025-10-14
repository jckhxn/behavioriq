"use client";

import { useState, useEffect } from "react";
import SimpleEmail from "@/components/admin/JSXEmailTemplates/SimpleEmail";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function EmailTemplateEditor() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Fetch template from API
    async function fetchTemplate() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/email-templates", {
          credentials: "include",
        });
        if (res.ok) {
          const templates = await res.json();
          if (Array.isArray(templates) && templates.length > 0) {
            setSubject(templates[0].subject || "");
            setHtml(templates[0].html || "");
            setPreviewHtml(templates[0].html || "");
          } else {
            // No templates seeded yet
            setSubject("");
            setHtml("");
            setPreviewHtml("");
          }
        } else {
          if (res.status === 401) {
            setErrorMsg(
              "Unauthorized — please sign in as a Super Admin to view templates."
            );
          } else {
            let err = "Failed to fetch templates";
            try {
              const body = await res.json();
              err = body.error || JSON.stringify(body);
            } catch (e) {
              // ignore
            }
            setErrorMsg(`Error fetching templates: ${err}`);
            console.warn(
              "Email templates API returned non-OK:",
              res.status,
              err
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch email templates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        body: JSON.stringify({ subject, html }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        setPreviewHtml(html);
        setErrorMsg(null);
        // small non-blocking confirmation UI would be nicer; keep alert for now
        alert("Email template saved successfully!");
      } else {
        let err = "Failed to save email template";
        try {
          const body = await res.json();
          err = body.error || JSON.stringify(body);
        } catch (e) {
          // ignore
        }
        setErrorMsg(`Error saving template: ${err}`);
        throw new Error(err);
      }
    } catch (error) {
      console.error("Failed to save email template:", error);
      if (!errorMsg)
        setErrorMsg("Failed to save email template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [mode, setMode] = useState<"html" | "jsx">("html");

  // Strip outer document and remove any <style> or <link> tags so JSX preview
  // doesn't inject global styles into the admin UI and cause layout shifts.
  function extractInnerHtml(docHtml: string) {
    if (!docHtml) return "";
    try {
      // If there is a <body> tag, extract its contents.
      const bodyMatch = docHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let inner = bodyMatch ? bodyMatch[1] : docHtml;

      // Remove any <style>...</style>, <link ...> and <script> tags that could affect layout.
      inner = inner.replace(/<style[\s\S]*?<\/style>/gi, "");
      inner = inner.replace(/<link[\s\S]*?>/gi, "");
      inner = inner.replace(/<script[\s\S]*?<\/script>/gi, "");

      // Remove inline style attributes (they may contain CSS variables like --sidebar-width)
      inner = inner.replace(/\sstyle=("[^"]*"|'[^']*')/gi, "");

      // Remove inline event handlers (onclick, onload, etc.) for safety
      inner = inner.replace(/\son[a-z]+=("[^"]*"|'[^']*')/gi, "");

      return inner;
    } catch (e) {
      return docHtml;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Template Editor</CardTitle>
        <CardDescription>
          Edit magic link, reset and other auth templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label className="block mb-2 font-semibold">Subject</label>
        <Textarea
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mb-4"
          placeholder="Email subject"
        />

        <label className="block mb-2 font-semibold">HTML Body</label>
        <Textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="mb-4 h-60 font-mono"
          placeholder="Email HTML"
        />

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save & Preview"}
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch("/api/admin/email-templates/render", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ subject, body: html }),
                });

                if (res.ok) {
                  const data = await res.json();
                  // update previewHtml with the saved rendered HTML
                  setPreviewHtml(data?.template?.html || "");
                  setErrorMsg(null);
                  alert("JSX template rendered and saved successfully.");
                } else {
                  let err = "Failed to render/save JSX template";
                  try {
                    const body = await res.json();
                    err = body.error || JSON.stringify(body);
                  } catch (e) {}
                  setErrorMsg(err);
                }
              } catch (e) {
                console.error(e);
                setErrorMsg("Failed to render/save JSX template");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Save JSX Template
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Live Preview</h3>
          <div className="border rounded p-0 max-h-[32rem] overflow-hidden bg-white">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Preview mode</div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-2 py-1 rounded text-sm ${mode === "html" ? "bg-slate-100" : ""}`}
                  onClick={() => setMode("html")}
                >
                  HTML
                </button>
                <button
                  className={`px-2 py-1 rounded text-sm ${mode === "jsx" ? "bg-slate-100" : ""}`}
                  onClick={() => setMode("jsx")}
                >
                  JSX
                </button>
              </div>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">
                Loading preview...
              </div>
            ) : errorMsg ? (
              <div className="p-4 text-sm text-destructive">{errorMsg}</div>
            ) : previewHtml ? (
              mode === "html" ? (
                // Use an isolated iframe to prevent app CSS from affecting email styles
                <iframe
                  title="Email preview"
                  key={previewHtml}
                  srcDoc={(() => {
                    const safeBody = previewHtml || "";
                    // If the HTML already contains a full document, use it as-is.
                    if (/\<html[\s>]/i.test(safeBody)) return safeBody;
                    return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
                      <style>
                        /* reset and readable defaults for previews */
                        html,body{height:100%;margin:0;padding:16px;background:#ffffff;color:#111827;font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;}
                        img{max-width:100%;height:auto}
                        table{border-collapse:collapse}
                      </style>
                    </head><body>${safeBody}</body></html>`;
                  })()}
                  className="w-full h-[32rem] border-0"
                />
              ) : (
                // JSX mode: render the SmallEmail component inline using Tailwind
                <div className="p-6">
                  <SimpleEmail
                    subject={subject}
                    body={extractInnerHtml(previewHtml)}
                  />
                </div>
              )
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                No template available. Save one or seed the database.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
