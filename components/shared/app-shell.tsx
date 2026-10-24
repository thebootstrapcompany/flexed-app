"use client";

import { Suspense } from "react";
import AppHeader from "./app-header";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-2 md:px-5">{children}</main>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}