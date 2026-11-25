import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import ProfileBuilder, { type BusinessRow } from "@/components/workspace/profile-builder";
import { createClient } from "@/lib/server";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Business",
};

type PageProps = {
    params: Promise<{ username: string }>;
};

export default function WorkspacePage({ params }: PageProps) {
    return (
        <Suspense fallback={<WorkspaceLoading />}>
            <WorkspaceContent params={params} />
        </Suspense>
    );
}

async function WorkspaceContent({ params }: PageProps) {
    await connection();
    const { username } = await params;
    if (!/^[a-zA-Z0-9]{3,128}$/.test(username)) {
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
        .select("id,username,name,email,phone,links,assets,features,metadata,automation")
        .eq("username", username)
        .eq("user_id", userId)
        .maybeSingle();
    if (error) {
        throw new Error("Unable to load workspace");
    }
    if (!business) {
        console.log('business not found')
        notFound();
    }
    return (
        <AppShell>
            <section className="w-full">
                <ProfileBuilder key={business.username} business={business as BusinessRow} />
            </section>
        </AppShell>
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