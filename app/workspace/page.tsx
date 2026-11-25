import type { Metadata } from "next";
import { AppShell } from "@/components/shared/app-shell";
// import Touchpoints from "@/components/workspace/touchpoints";
import BusinessCards from "@/components/workspace/business-cards";

export const metadata: Metadata = {
    title: "Workspace",
};

export default function WorkspacePage() {
    return (
        <AppShell>
            <section className="w-full">
                <BusinessCards />
                {/* <Touchpoints /> */}
            </section>
        </AppShell>
    );
}