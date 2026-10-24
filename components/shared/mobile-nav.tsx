"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils"
import { navigation } from "@/lib/navigation";

export function MobileNav() {
    const pathname = usePathname();
    return (
        <nav className="fixed bottom-3 left-1/2 z-9999 flex h-17 w-fit -translate-x-1/2 items-center justify-center rounded-full border bg-card/95 px-5 gap-1 shadow-lg backdrop-blur-xl md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} >
            {navigation.map((item) => {
                const Icon = item.icon;
                const href = `/${item.href.replace(/^\/+/, "")}`;
                const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
                return (
                    <Link key={item.href} href={item.href} className={cn("flex min-w-14.5 flex-col items-center justify-center gap-1 rounded-2xl px-2 pb-1 transition-colors", active ? "text-foreground" : "text-muted-foreground hover:text-foreground")} >
                        <span className={cn("flex size-8 items-center justify-center rounded-full transition-colors", active && "text-primary-foreground",)} >
                            <Icon className={`size-4.5 ${active && "text-accent-foreground"}`} />
                        </span>
                        <span className={`text-[10px] font-medium leading-none ${active && "text-accent-foreground"}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}