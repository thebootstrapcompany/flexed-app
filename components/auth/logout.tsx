"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/client";
import { ThemeToggle } from "../shared/theme-toggle";

export function Logout() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [email, setEmail] = useState("")

    const router = useRouter();

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            setIsLoggingOut(false);
            return;
        }
        router.replace("/login");
        setIsLoggingOut(false);
    };

    useEffect(() => {
        const getUser = async () => {
            const user = await supabase.auth.getUser();
            if (user) {
                setEmail(user.data.user?.email ?? "");
            }
        }
        getUser();
    }, [])

    const handleCancel = () => router.back();

    return (
        <main className="min-h-svh w-full bg-background text-foreground">
            <header className="fixed top-0 right-0 z-40 flex h-19 shrink-0 items-center px-4 md:px-6">
                <div className="flex items-center rounded-full border bg-card/90 shadow-sm backdrop-blur-md">
                    <ThemeToggle />
                </div>
            </header>
            <div className="flex min-h-svh flex-col px-10">
                <section className="flex flex-1 items-center justify-center py-16">
                    <div className="flex w-full max-w-md flex-col items-center text-center">
                        <h1 className="text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Want to Logout?</h1>
                        <p className="mt-4 text-sm text-muted-foreground sm:text-base">You&apos;re signed in as</p>
                        <p className="mt-1 max-w-full break-all text-sm font-medium text-foreground sm:text-base">{email ?? ""}</p>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Your session will end and you&apos;ll need to sign in again to access Flexed.</p>
                        <div className="mt-8 flex w-full flex-col gap-3">
                            <Button type="button" disabled={isLoggingOut} onClick={handleLogout} className="h-11 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-base">
                                {isLoggingOut ? "Logging out..." : "Log out"}
                            </Button>
                            <Button type="button" variant="outline" disabled={isLoggingOut} onClick={handleCancel} className="h-11 w-full rounded-full border-border bg-transparent text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground sm:h-12 sm:text-base">
                                Stay signed in
                            </Button>
                        </div>
                    </div>
                </section>
                <footer className="flex shrink-0 flex-col items-center pb-7 pt-8 sm:pb-8 sm:pt-10">
                    <div className="mt-4 flex items-center gap-2.5 text-xs sm:text-sm">
                        <a href="/terms" className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">Terms of use</a>
                        <span className="select-none text-border">|</span>
                        <a href="/privacy" className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">Privacy policy</a>
                        <span className="select-none text-border">|</span>
                        <a href="/privacy" className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">Contact Us</a>
                    </div>
                </footer>
            </div>
        </main>
    );
}