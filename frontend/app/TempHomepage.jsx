"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import config from "@/data/config.json";

export default function TempHomepage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const currentEvent = config.redirects[config.redirects.current];

  useEffect(() => {
    if (countdown === 0) {
      router.replace(currentEvent.path);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-xl bg-white p-8 shadow-lg text-center">
        <h1 className="mb-4 text-2xl font-bold">
          Đang chuyển hướng...
        </h1>

        <p className="text-gray-600">
          Bạn sẽ được chuyển hướng đến trang{" "}
          <span className="font-semibold text-blue-600">{currentEvent.name}</span> trong{" "}
          <span className="font-bold text-lg">{countdown}</span>{" "}giây nữa.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>

        <button
          onClick={() => router.replace(currentEvent.path)}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Chuyển hướng ngay
        </button>
      </div>
    </div>
  );
}