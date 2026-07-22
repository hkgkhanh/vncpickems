import Navbar from "@/components/Navbar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}