"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Calendar, FolderOpen, CheckCircle, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/capture", label: "记录", icon: Plus },
  { href: "/today", label: "今天", icon: Calendar },
  { href: "/projects", label: "项目", icon: FolderOpen },
  { href: "/review", label: "回顾", icon: CheckCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full touch-manipulation transition-colors",
                isActive
                  ? "text-primary-600"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
