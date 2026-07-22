"use client";

export default function ReadOnlyField({ label, value }) {
  return (
    <div className="flex items-center gap-4">

      <label className="w-40 shrink-0 font-medium align-right">
        {label}
      </label>

      <input
        readOnly
        value={value ?? ""}
        className="flex-1 rounded border bg-gray-100 px-3 py-2 cursor-not-allowed"
      />

    </div>
  );
}