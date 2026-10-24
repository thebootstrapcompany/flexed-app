export default function BusinessLoading() {
    return (
        <main className="min-h-dvh w-full bg-neutral-800 sm:bg-neutral-700" role="status" aria-label="Loading business profile" aria-busy="true">
            <div className="relative isolate mx-auto flex min-h-dvh w-full max-w-140 flex-col overflow-hidden bg-neutral-950 text-white sm:shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 -z-10">
                    <div className="h-full w-full animate-pulse bg-linear-to-br from-neutral-800 via-neutral-900 to-orange-950" />
                    <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 to-black/85" />
                </div>
                <div className="min-h-20 flex-1 sm:min-h-28" />
                <section className="relative z-10 m-2 rounded-[32px] border border-white/15 bg-neutral-950/80 shadow-[0_-20px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
                    <div className="flex justify-center py-2" />
                    <div className="px-5 pb-8 sm:px-8 animate-pulse">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 bg-white/15 sm:h-20 sm:w-20" />
                            <div className="min-w-0 flex-1 space-y-3">
                                <div className="h-6 w-3/4 rounded-lg bg-white/15 sm:h-7" />
                                <div className="h-4 w-1/2 rounded-md bg-white/10" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="h-3.5 w-full rounded-md bg-white/10" />
                            <div className="h-3.5 w-11/12 rounded-md bg-white/10" />
                            <div className="h-3.5 w-3/5 rounded-md bg-white/10" />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-11 w-11 rounded-xl border border-white/10 bg-white/10" />
                            ))}
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex min-h-12 items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                                <div className="h-5 w-5 shrink-0 rounded-md bg-white/15" />
                                <div className="h-3.5 w-2/3 rounded-md bg-white/15" />
                            </div>
                            <div className="flex min-h-12 items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                                <div className="h-5 w-5 shrink-0 rounded-md bg-white/15" />
                                <div className="h-3.5 w-1/2 rounded-md bg-white/15" />
                            </div>
                            <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/85 px-4 py-3">
                                <div className="h-5 w-5 rounded-md bg-neutral-400/50" />
                                <div className="h-3.5 w-28 rounded-md bg-neutral-400/50" />
                                <div className="h-4 w-4 rounded-md bg-neutral-400/50" />
                            </div>
                        </div>
                        <footer className="mt-4 flex justify-center gap-2">
                            <div className="h-3 w-16 rounded-md bg-white/10" />
                            <div className="h-3 w-12 rounded-md bg-white/15" />
                        </footer>
                    </div>
                </section>
            </div>
            <aside className="fixed bottom-8 right-8 hidden flex-col items-center gap-2 text-white xl:flex" aria-hidden="true">
                <div className="h-4 w-28 animate-pulse rounded-md bg-white/20" />
                <div className="flex h-32 w-32 animate-pulse items-center justify-center rounded-xl bg-white p-3 shadow-lg">
                    <div className="h-full w-full rounded-md bg-neutral-200" />
                </div>
            </aside>
            <span className="sr-only">Loading...</span>
        </main>
    );
}