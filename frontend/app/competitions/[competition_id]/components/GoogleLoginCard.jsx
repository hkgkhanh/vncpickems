"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";

export default function GoogleLoginCard() {
  const { loginSuccess } = useGoogleAuth();

  return (
    <div className="rounded-xl border p-6 text-center border bg-white shadow-sm">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={loginSuccess}
          onError={() => console.error("Google Login Failed")}
        />
      </div>
      <p className="mt-2 text-gray-500">
        Chúng tôi sử dụng Google SSO để định danh cho dự đoán của bạn.
      </p>
    </div>
  );
}