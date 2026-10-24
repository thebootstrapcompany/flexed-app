"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigation } from "@/lib/navigation";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center rounded-full border bg-card/90 p-1 shadow-sm backdrop-blur-md md:flex">
      {navigation.map((item) => {
        const Icon = item.icon;
        const href = `/${item.href.replace(/^\/+/, "")}`;

        const active =
          pathname === href ||
          (href !== "/" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={item.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4 md:hidden lg:block" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}