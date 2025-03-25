"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./authContext";

export default function Topbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const publicNavigation: never[] = [];

  const privateNavigation = [
    { name: "Projects", href: "/projects" },
    { name: "Editor", href: "/editor" },
    { name: "Play", href: "/play" },
    { name: "Profile", href: "/profile" },
  ];

  const navigation = user ? privateNavigation : publicNavigation;

  return (
    <nav className="pl-10 fixed top-0 z-50 w-full border-b border-neutral-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-white">Splitudio</span>
        </Link>
        <div className="flex gap-6 md:gap-10">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === item.href ? "text-white" : "text-neutral-400"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <Link
              href="/logout"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/logout" ? "text-white" : "text-neutral-400"
              )}
            >Logout</Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/login" ? "text-white" : "text-neutral-400"
              )}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
