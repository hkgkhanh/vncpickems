"use client";

export default function TextInput({ label, value, onChange, placeholder, required = true }) {
  return (
    <div className="flex items-center gap-4 my-2">

      <label className="w-29 shrink-0 font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded border bg-gray-100 px-3 py-2"
      />

    </div>
  );
}