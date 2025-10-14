import React from "react";

type Props = {
  subject?: string;
  body?: string; // HTML body that will be inserted
};

// A very small, tailwind-driven email-like component for previewing in the admin UI.
// Note: Tailwind classes will apply in the admin UI. For production email HTML you
// should render this component to HTML server-side and inline styles for clients.
export default function SimpleEmail({ subject = "", body = "" }: Props) {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-md shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-sky-600 to-emerald-500 p-6">
        <h1 className="text-white text-lg font-semibold">
          {subject || "Your message"}
        </h1>
      </div>
      <div className="p-6 text-slate-800 leading-relaxed text-sm">
        {/* If body contains raw HTML we render it inside */}
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <p className="text-slate-700">
            This is a preview of your email content. Add HTML or use the editor
            to modify.
          </p>
        )}

        <div className="mt-6 border-t pt-4 text-xs text-slate-500">
          Sent with care from Your Company
        </div>
      </div>
    </div>
  );
}
