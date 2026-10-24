import { Suspense } from "react";
import { DesktopNav } from "./desktop-nav";
import { ThemeToggle } from "./theme-toggle";

const AppHeader = () => {
    return (
        <header className="sticky top-0 z-40 flex h-19 shrink-0 items-center px-4 md:px-6">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
                <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
                    <div className="flex min-w-0 items-center">
                        <div className="flex items-center rounded-full border bg-card/90 px-3 py-2 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <span className="text-base text-foreground">FLEXED</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
                    <Suspense fallback={null}>
                        <DesktopNav />
                    </Suspense>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center rounded-full border bg-card/90 p-1 shadow-sm backdrop-blur-md">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AppHeader