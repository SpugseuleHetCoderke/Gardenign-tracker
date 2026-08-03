"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Vandaag", icon: "☀️" },
  { href: "/loggen", label: "Noteren", icon: "✅" },
  { href: "/planten", label: "Planten", icon: "🪴" },
  { href: "/soorten", label: "Naslag", icon: "📖" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-10 border-t border-border-soft bg-surface"
      // Keeps the bar clear of the phone's home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
