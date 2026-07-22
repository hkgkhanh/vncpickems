import LogoutButton from "./LogoutButton";
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="text-xl font-semibold">
        <Link href="/admin">VNC Pickems Admin</Link>
      </div>

      <div className="flex items-center gap-4">
        <LogoutButton />
      </div>
    </nav>
  );
}