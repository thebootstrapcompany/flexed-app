"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

type BusinessUnavailableProps = {
    reason?: "not-found" | "error";
    code?: string;
};

export default function BusinessUnavailable({ reason = "not-found", code }: BusinessUnavailableProps) {
    const router = useRouter();
    const [retrying, setRetrying] = useState(false);
    const isError = reason === "error";

    const handleRetry = () => {
        setRetrying(true);
        router.refresh();
        setTimeout(() => setRetrying(false), 2500);
    };

    return (
        <main className="min-h-dvh w-full bg-neutral-800 sm:bg-neutral-700">
            <div className="relative isolate mx-auto flex min-h-dvh w-full max-w-140 flex-col overflow-hidden bg-neutral-950 text-white sm:shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 -z-10">
                    <div className="h-full w-full bg-linear-to-br from-neutral-800 via-neutral-900 to-orange-950" />
                    <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 to-black/85" />
                    <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
                </div>

                <header className="relative z-10 flex w-full shrink-0 items-center justify-center px-5 pb-8 pt-10 sm:pt-12">
                    <a href="https://flexed.in" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold tracking-tight text-white transition-opacity hover:opacity-80">
                        flexed<span className="text-orange-500">.</span>
                    </a>
                </header>

                <div className="flex min-h-20 flex-1 flex-col items-center justify-center px-6 pb-10 sm:min-h-28">
                    <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-[28px] border border-orange-500/20 bg-orange-500/10 shadow-[0_0_70px_rgba(249,115,22,0.1)]">
                        <div className="absolute inset-3 rounded-[20px] border border-orange-500/10" />
                        <AlertCircle className="relative h-10 w-10 text-orange-400" strokeWidth={1.5} />
                    </div>
                    <span className="mb-3 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium tracking-wide text-orange-300">
                        {isError ? "TEMPORARILY UNAVAILABLE" : "PROFILE NOT FOUND"}
                    </span>
                    <h1 className="max-w-sm text-center text-3xl font-semibold tracking-tight sm:text-4xl">
                        {isError ? "Something went wrong." : "We couldn't find this business."}
                    </h1>
                    <p className="mt-4 max-w-sm text-center text-sm leading-relaxed text-neutral-400 sm:text-base">
                        {isError
                            ? "We're having trouble loading this business profile right now. Please try again in a moment."
                            : "This business profile may not exist, may have moved, or its link might be incorrect."}
                    </p>
                    {code && (
                        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                            <span className="text-xs text-neutral-500">Business code </span>
                            <span className="font-mono text-xs font-medium text-neutral-300">{code}</span>
                        </div>
                    )}
                </div>

                <section className="relative z-10 m-2 rounded-[32px] border border-white/15 bg-neutral-950/80 shadow-[0_-20px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
                    <div className="px-5 pb-8 pt-7 sm:px-8">
                        <h2 className="text-lg font-semibold tracking-tight">What can you do?</h2>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                            {isError ? "Try reloading the profile or visit Flexed." : "Double-check the QR code or link you used, then try again."}
                        </p>

                        <div className="mt-6 space-y-3">
                            <button type="button" onClick={handleRetry} disabled={retrying} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-60">
                                <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
                                {retrying ? "Trying again..." : "Try again"}
                            </button>
                            <a href="https://flexed.in" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/15">
                                Visit Flexed <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>

                        <footer className="mt-8 text-center">
                            <p className="text-xs text-neutral-400">
                                powered by{" "}
                                <a href="https://flexed.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-white">
                                    flexed<span className="text-orange-500">.</span>
                                </a>
                            </p>
                        </footer>
                    </div>
                </section>
            </div>
        </main>
    );
}