"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Globe, Loader2, Plus, QrCode } from "lucide-react";
import { supabase } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";
import { useTouchpointStore, type Touchpoint } from "@/stores/use-touchpoint-store";
import { TouchpointDrawer } from "./touchpoint-drawer";

type TouchpointRow = {
    code: string;
    metadata: unknown;
    status: string | null;
    created_at: string;
};

type TouchpointMetadata = {
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    links?: Touchpoint["links"];
};

export default function Touchpoints({ businessId }: { businessId: string }) {
    const router = useRouter();
    const { touchpoints, setTouchpoints, clearTouchpoints } = useTouchpointStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [readyBusinessId, setReadyBusinessId] = useState<string | null>(null);

    const fetchTouchpoints = useCallback(async (isCancelled: () => boolean) => {
        setLoading(true);
        setError(null);
        setReadyBusinessId(null);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (isCancelled()) return;
            if (authError || !user) throw new Error("Unauthorized");

            const { data, error: fetchError } = await supabase.from("touchpoints").select("code, metadata, status, created_at").eq("user_id", user.id).eq("business_id", businessId).order("created_at", { ascending: false });
            if (isCancelled()) return;
            if (fetchError) throw fetchError;

            const items: Touchpoint[] = ((data ?? []) as TouchpointRow[]).map((item) => {
                const metadata = item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata) ? item.metadata as TouchpointMetadata : {};
                return {
                    code: item.code,
                    name: metadata.name ?? "Untitled",
                    username: metadata.username ?? "",
                    email: metadata.email ?? "",
                    phone: metadata.phone ?? "",
                    links: metadata.links ?? {} as Touchpoint["links"],
                    createdAt: item.created_at
                };
            });

            setTouchpoints(items, user.id);
            setReadyBusinessId(businessId);
        } catch (err) {
            if (isCancelled()) return;
            clearTouchpoints();
            setError(err instanceof Error ? err.message : "Failed to fetch touchpoints.");
        } finally {
            if (!isCancelled()) setLoading(false);
        }
    }, [businessId, setTouchpoints, clearTouchpoints]);

    useEffect(() => {
        let cancelled = false;
        void fetchTouchpoints(() => cancelled);
        return () => { cancelled = true; };
    }, [fetchTouchpoints, retryKey]);

    const items = readyBusinessId === businessId && !loading && !error ? touchpoints : [];
    const onCreate = () => setCreateOpen(true);
    const onCreated = () => { setCreateOpen(false); setRetryKey((value) => value + 1); };

    return (
        <>
            {loading ? (
                <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-6 animate-spin" /></div>
            ) : error ? (
                <div className="mt-4 flex min-h-48 flex-col items-center justify-center gap-3 text-center" role="alert">
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>
                </div>
            ) : items.length === 0 ? (
                <TouchpointEmptyState onCreate={onCreate} />
            ) : (
                <>
                    {/* <div className="flex items-center justify-end">
                        <Button size="sm" onClick={onCreate}><Plus className="size-4" />Add New</Button>
                    </div> */}
                    <div className="p-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <Card key={item.code} className="group cursor-pointer rounded-2xl bg-card p-0 shadow-none transition-colors hover:bg-muted/30" onClick={() => router.push(`/workspace/touchpoint/${item.code}`)}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50"><QrCode className="size-5 text-muted-foreground" /></div>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-[15px] font-semibold tracking-tight">{item.name ?? "Untitled"}</h3>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{item.code.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Card onClick={onCreate} className="group cursor-pointer rounded-2xl bg-card p-0 shadow-none transition-colors hover:bg-muted/30">
                            <div className="flex items-center justify-center min-h-18 gap-4">
                                <div className="flex min-w-0 items-center justify-center gap-3 rounded-full border-2 border-dashed border-muted/50 p-3 group-hover:border-muted/50 transition-opacity">
                                    <Plus className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
            <TouchpointDrawer open={createOpen} onOpenChange={setCreateOpen} businessId={businessId} onCreated={onCreated} />
        </>
    );
}

function TouchpointEmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-lg text-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon"><QrCode className="size-4" /></EmptyMedia>
                    <EmptyTitle>No Touchpoints Found</EmptyTitle>
                    <EmptyDescription>Add your first touchpoint to start connecting with customers.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button type="button" onClick={onCreate}><Plus className="size-4" />Add New</Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}