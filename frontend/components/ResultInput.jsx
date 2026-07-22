"use client";

export function formatCentisecondsInput(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const centiseconds = Number(value);

  const minutes = Math.floor(centiseconds / 6000);
  const remaining = centiseconds % 6000;

  const seconds = Math.floor(remaining / 100);
  const cs = remaining % 100;

  if (minutes > 0) {
    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${cs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${seconds}.${cs
    .toString()
    .padStart(2, "0")}`;
}

export default function ResultInput({
  value,
  onChange,
}) {
  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, "");

    onChange(digits === "" ? null : Number(digits));
  }

  return (
    <input
      value={formatCentisecondsInput(value)}
      onChange={handleChange}
      inputMode="numeric"
      className="flex-1 rounded border bg-gray-100 px-3 py-2"
    />
  );
}