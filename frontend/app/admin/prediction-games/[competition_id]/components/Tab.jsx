"use client";

export default function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-5 py-3 transition cursor-pointer ${
        active
          ? "border-blue-600 text-blue-600 font-semibold"
          : "border-transparent text-gray-500 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}