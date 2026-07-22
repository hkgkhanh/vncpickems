"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      onClick={logout}
      className="rounded-md bg-red-600 px-4 py-2 text-white transition cursor-pointer hover:bg-red-700"
    >
      Đăng xuất
    </button>
  );
}