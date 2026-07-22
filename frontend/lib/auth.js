import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "./url_utils";

export async function requireAdmin() {
  const cookieStore = await cookies();

  const response = await fetch(
    getApiUrl(`${process.env.NEXT_PUBLIC_API_URL}/admins/me`),
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    redirect("/login?next=/admin");
  }

  return response.json();
}