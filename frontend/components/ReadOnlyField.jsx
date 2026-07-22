"use client";

export default function ReadOnlyField({ label, value }) {
  return (
    <div className="flex items-center gap-4">

      <label className="shrink-0 font-medium text-right">
        {label}
      </label>

      <p
        className="flex-1 border-none px-3 py-2 text-right"
      >
        {value ?? ""}
      </p>

    </div>
  );
}