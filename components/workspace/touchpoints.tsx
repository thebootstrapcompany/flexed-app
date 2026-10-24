"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Globe, Loader2, Mail, Phone, Plus, QrCode } from "lucide-react";
import { supabase } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";
import { useTouchpointStore, type Touchpoint } from "@/stores/use-touchpoint-store";

export default function Touchpoints() {
    const router = useRouter();
    const { touchpoints, userId, loaded, setTouchpoints, clearTouchpoints } = useTouchpointStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);
    const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchTouchpoints = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (cancelled) return;
                if (authError || !user) throw new Error("Unauthorized");
                setVerifiedUserId(user.id);
                const cached = useTouchpointStore.getState();
                if (cached.loaded && cached.userId === user.id) return;
                if (cached.userId && cached.userId !== user.id) clearTouchpoints();
                const { data, error } = await supabase.from("businesses").select("code,name,slug,email,phone,links,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
                if (error) throw error;
                if (cancelled) return;
                const items: Touchpoint[] = (data ?? []).map((item) => ({
                    code: item.code,
                    name: item.name,
                    slug: item.slug,
                    email: item.email,
                    phone: item.phone,
                    links: (item.links ?? {}) as Touchpoint["links"],
                    createdAt: item.created_at
                }));
                setTouchpoints(items, user.id);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : "Failed to fetch touchpoints.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (!loaded) {
            void fetchTouchpoints();
        }

        return () => {
            cancelled = true;
        };
    }, [retryKey, setTouchpoints, clearTouchpoints]);

    const isReady = loaded && userId === verifiedUserId;
    const items = isReady ? touchpoints : [];
    const onCreate = () => router.push("/workspace/create");

    return (
        <>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold tracking-tight">Touchpoints</h2>
                    <p className="mt-1 hidden text-sm text-muted-foreground md:block">Create, manage and track touchpoints for your business.</p>
                </div>
                <Button size="sm" onClick={onCreate}>
                    <Plus className="size-4" />
                    Add New
                </Button>
            </div>

            {loading ? (
                <div className="flex min-h-[80vh] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : error ? (
                <div className="mt-4 flex min-h-125 flex-col items-center justify-center gap-3 text-center" role="alert">
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>
                </div>
            ) : !isReady ? (
                <div className="mt-4 flex min-h-125 items-center justify-center text-sm text-muted-foreground">Unable to load touchpoints.</div>
            ) : items.length === 0 ? (
                <TouchpointEmptyState onCreate={onCreate} />
            ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Card key={item.code} className="group cursor-pointer rounded-2xl bg-card p-0 shadow-none transition-colors hover:bg-muted/30" onClick={() => router.push(`/workspace/touchpoint/${item.code}`)}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                                            <QrCode className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="truncate text-[15px] font-semibold tracking-tight">{item.name ?? "Untitled"}</h3>
                                            <p className="mt-0.5 text-xs text-muted-foreground">{item.code}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                                    {typeof item.links.business_url === "string" && item.links.business_url && (
                                        <div className="flex items-start gap-3">
                                            <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">Destination</p>
                                                <p className="mt-0.5 truncate text-sm">{item.links.business_url.replace(/^https?:\/\//, "")}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={`mt-5 flex items-center ${item.slug ? "justify-between" : "justify-end"} gap-3 border-t pt-4`}>
                                    {item.slug && (
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-medium text-muted-foreground">{item.slug}</span>
                                        </div>
                                    )}
                                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}

function TouchpointEmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="mt-4 flex min-h-125 flex-col items-center justify-center rounded-lg px-6 text-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <QrCode className="size-4" />
                    </EmptyMedia>
                    <EmptyTitle>No Touchpoints Found</EmptyTitle>
                    <EmptyDescription>
                        You haven&apos;t created any touchpoints yet.
                        Create your first touchpoint to start connecting
                        with customers and tracking scans.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button type="button" onClick={onCreate}>
                        <Plus className="size-4" />
                        Add New
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}