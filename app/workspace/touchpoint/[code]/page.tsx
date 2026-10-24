
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import ProfileBuilder, { type BusinessRow } from "@/components/workspace/profile-builder";
import { createClient } from "@/lib/server";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Touchpoint",
};

type PageProps = {
    params: Promise<{ code: string }>;
};

async function WorkspaceContent({ params }: PageProps) {
    await connection();

    const { code } = await params;

    if (!/^[a-zA-Z0-9]{5}$/.test(code)) {
        notFound();
    }

    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (authError || !userId) {
        redirect("/login");
    }

    const { data: business, error } = await supabase
        .from("businesses")
        .select("code,slug,name,email,phone,links,metadata")
        .eq("code", code)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Business lookup failed:", error.code);
        throw new Error("Unable to load workspace");
    }

    if (!business) {
        notFound();
    }

    return (
        <AppShell>
            <section className="w-full">
                <ProfileBuilder key={business.code} business={business as BusinessRow} />
            </section>
        </AppShell>
    );
}

export default function WorkspacePage({ params }: PageProps) {
    return (
        <Suspense fallback={<WorkspaceLoading />}>
            <WorkspaceContent params={params} />
        </Suspense>
    );
}

function WorkspaceLoading() {
    return (
        <AppShell>
            <div className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        </AppShell>
    );
}