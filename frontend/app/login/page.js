"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiUrl } from "@/lib/url_utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/login`),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (!response.ok) {
        setError("Tên đăng nhập hoặc mật khẩu không hợp lệ.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Kết nối đến máy chủ thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
    >
      <h1 className="mb-8 text-center text-3xl font-bold">
        Đăng nhập Admin
      </h1>

      <div className="mb-5">
        <label className="mb-2 block font-medium">
          Tên đăng nhập
        </label>

        <input
          className="w-full rounded-lg border p-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="mb-5">
        <label className="mb-2 block font-medium">
          Mật khẩu
        </label>

        <input
          type="password"
          className="w-full rounded-lg border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="mb-4 text-red-500">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <Suspense fallback={<div className="text-center">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}