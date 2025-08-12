"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Map, UploadIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export default function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Interactive Map", href: "/map", icon: Map },
    { name: "Upload Locations", href: "/upload", icon: UploadIcon },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className=" border-r w-16 md:w-56 flex flex-col">
        <div className="p-4 flex flex-col items-center md:items-start gap-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 w-full p-2 rounded-md hover:bg-gray-200 transition-colors",
                  isActive ? "bg-gray-200 font-bold" : ""
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline text-sm">{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto p-4">
          <form action="/auth/logout" method="post">
            <Button
              type="submit"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="flex items-center justify-left px-6 py-4 border-b bg-white mb-6 gap-4">
          <span className="text-md tracking-tight font-bold">{title}</span>
        </header>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
