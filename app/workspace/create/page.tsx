import type { Metadata } from "next";
import { AppShell } from "@/components/shared/app-shell";
import ScanPage from "@/components/workspace/scanner";

export const metadata: Metadata = {
    title: "Workspace",
};

export default function WorkspacePage() {
    return (
        <AppShell>
            <section className="w-full space-y-4">
                <ScanPage />
            </section>
        </AppShell>
    );
}