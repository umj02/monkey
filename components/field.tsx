import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span>
      <input {...props} className={`h-[52px] w-full rounded-[18px] border bg-white px-4 text-sm font-semibold outline-none transition placeholder:text-gray-400 focus:border-monkey-green focus:ring-4 focus:ring-green-100 ${error ? "border-monkey-pink" : "border-monkey-line"}`} />
      {error ? <span className="mt-2 block text-xs font-bold text-monkey-pink">{error}</span> : null}
    </label>
  );
}

export function TextAreaField({ label, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span>
      <textarea {...props} className={`min-h-[120px] w-full resize-none rounded-[18px] border bg-white px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-gray-400 focus:border-monkey-green focus:ring-4 focus:ring-green-100 ${error ? "border-monkey-pink" : "border-monkey-line"}`} />
      {error ? <span className="mt-2 block text-xs font-bold text-monkey-pink">{error}</span> : null}
    </label>
  );
}
