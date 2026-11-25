"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink, Loader2, Building, Building2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useBusinessStore, type Business } from "@/stores/use-business-store";
import { supabase } from "@/lib/client";
import { toast } from "sonner";

export const fetchReviewLink = async (mapsUrl: URL) => {
    let response;
    try {
        response = await fetch("https://productmate.com/api/v1/google-review-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ maps_url: mapsUrl }),
            signal: AbortSignal.timeout(10000),
        });
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.error(error);
        throw new Error("We couldn't verify your Google Maps link. Please try again.");
    }
    const responseText = await response.text();
    let result;
    try {
        result = JSON.parse(responseText);
    } catch {
        result = null;
    }
    if (!response.ok) {
        if (process.env.NODE_ENV === "development") console.error("Maps verification failed:", response.status, responseText);
        toast.error(response.status === 429 ? "Too many attempts. Please try again shortly." : response.status >= 500 ? "Google Maps verification is temporarily unavailable. Please try again later." : "We couldn't verify this Google Maps link. Check the link and try again.");
    }
    if (!result || typeof result !== "object") {
        throw new Error("We couldn't verify this Google Maps link. Please try again.");
    }
    const { place_id, review_url } = result;
    if (typeof place_id !== "string" || !place_id.trim() || typeof review_url !== "string") {
        throw new Error("This Google Maps link couldn't be verified. Check that it points to your business.");
    }
    let parsedReviewUrl;
    try {
        parsedReviewUrl = new URL(review_url);
    } catch {
        throw new Error("We couldn't generate a Google review link. Please try again.");
    }
    if (parsedReviewUrl.origin !== "https://search.google.com" || parsedReviewUrl.pathname !== "/local/writereview" || parsedReviewUrl.searchParams.get("placeid") !== place_id) {
        throw new Error("We couldn't verify this business's Google review link. Please try again.");
    }
    return parsedReviewUrl.href;
}

export default function BusinessCards() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        mapsUrl: "",
    });
    const [initialLoading, setInitialLoading] = useState(true)
    const [loading, setLoading] = useState(false);

    const { businesses, setBusinesses, addBusiness } = useBusinessStore();

    useEffect(() => {
        let cancelled = false;
        const loadBusinesses = async () => {
            setInitialLoading(true);
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!user) throw new Error("Please sign in to continue.");
                const { data, error } = await supabase
                    .from("businesses")
                    .select("id, name, username, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });
                if (error) {
                    process.env.NODE_ENV === "development" ? console.log(error) : toast.error("Couldn't load your businesses. Please try again.");
                }
                if (!cancelled) {
                    setBusinesses(data ?? [])
                };
            } catch (err) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Failed to load businesses:", err);
                }
                if (!cancelled) {
                    toast.error("Couldn't load your businesses. Please try again.");
                }
            } finally {
                if (!cancelled) setInitialLoading(false);
            }
        };
        void loadBusinesses();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleCreate = async () => {
        const { name, username, email, phone, mapsUrl } = formData;
        const nameTrimmed = name.trim();
        const usernameTrimmed = username.trim().toLowerCase();
        const emailTrimmed = email.trim().toLowerCase();
        const phoneTrimmed = phone.trim();
        const mapsUrlTrimmed = mapsUrl.trim();
        if (!nameTrimmed) return toast.error("Enter your business name.");
        if (!usernameTrimmed) return toast.error("Choose a username for your business.");
        if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) return toast.error("Enter a valid email address.");
        if (phoneTrimmed && !/^\+?[0-9]{10}$/.test(phoneTrimmed)) return toast.error("Enter a valid 10-digit phone number.");
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(usernameTrimmed)) return toast.error("Use lowercase letters, numbers, and hyphens for your username.");
        setLoading(true);
        try {
            let review = "";
            if (mapsUrl) {
                let parsedMapsUrl;
                try {
                    parsedMapsUrl = new URL(mapsUrl);
                } catch {
                    throw new Error("Enter a valid Google Maps link.");
                }
                if (parsedMapsUrl.protocol !== "https:" || !["maps.app.goo.gl"].includes(parsedMapsUrl.hostname)) {
                    throw new Error("Use a valid Google Maps share link.");
                }
                const review = fetchReviewLink(parsedMapsUrl);
            }
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("Please sign in to continue.");
            const { data, error } = await supabase
                .from("businesses")
                .insert({
                    user_id: user.id,
                    name,
                    username,
                    email: email || null,
                    phone: phone || null,
                    links: {
                        maps: mapsUrl,
                        reviews: review,
                    },
                })
                .select('id, name, username, created_at')
                .single();
            if (error) {
                if (process.env.NODE_ENV === "development") console.error(error);
                if (error.code === "23505") throw new Error("This username is already taken. Choose another.");
                if (error.code === "42501") throw new Error("You don't have permission to create this business. Please sign in again.");
                toast.error("We couldn't create your business. Please try again.");
            }
            setFormData({ name: "", username: "", email: "", phone: "", mapsUrl: "" });
            if (data) { addBusiness(data) }
            setOpen(false);
            toast.success(`${data?.name} created successfully.`);
        } catch (error: unknown) {
            if (process.env.NODE_ENV === "development") console.error("Business creation failed:", error);
            toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold tracking-tight">Businesses</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Create and manage your businesses.</p>
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger
                        render={
                            <Button size="sm" disabled={loading}>
                                <Plus className="size-4" />
                                {loading ? "Creating..." : "Create"}
                            </Button>
                        }
                    />
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>Create Business</SheetTitle>
                            <SheetDescription>Add a new business to track and share.</SheetDescription>
                        </SheetHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="flex flex-col gap-4 p-4 pt-0">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Acme Corp" value={formData.name} onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))} required disabled={loading} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" placeholder="acme-corp" value={formData.username} onChange={(e) => setFormData((s) => ({ ...s, username: e.target.value }))} required disabled={loading} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="contact@acmecorp.com" value={formData.email} onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))} disabled={loading} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" placeholder="9876543210" value={formData.phone} onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))} disabled={loading} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="mapsUrl">Maps URL</Label>
                                <Input id="mapsUrl" placeholder="https://maps.app.goo.gl/..." value={formData.mapsUrl} onChange={(e) => setFormData((s) => ({ ...s, mapsUrl: e.target.value }))} disabled={loading} />
                            </div>
                            <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-2">
                                <p className="font-medium">Instructions</p>
                                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                                    <li>
                                        Open
                                        <a href="https://maps.google.com/" target="_blank" className="inline-flex items-center gap-1 font-medium text-primary mx-1 underline">Google Maps </a>
                                        and search for your business.</li>
                                    <li>Select your business profile. Click or tap <strong>Share</strong> and Select <strong>Copy link</strong>.</li>
                                    <li>Paste the copied link into the Maps URL field above.</li>
                                </ol>
                            </div>
                            <Button type="submit" className="mt-2" disabled={loading || !formData.name || !formData.username || formData.username.length < 3}>
                                {loading ? "Creating..." : "Create"}
                            </Button>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>
            {!initialLoading && businesses.length === 0
                ? <div className="mt-4 flex min-h-125 flex-col items-center justify-center rounded-lg px-6 text-center">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Building2Icon className="size-4" />
                            </EmptyMedia>
                            <EmptyTitle>No Businesses Found</EmptyTitle>
                            <EmptyDescription>
                                Create your first business to get started with tracking touchpoints and managing your profile.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                            <Button type="button" onClick={() => setOpen(true)}>
                                <Plus className="size-4" />
                                Create
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
                : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((item) => (
                        <Card key={item.id} className="group cursor-pointer rounded-2xl bg-card p-0 shadow-none transition-colors hover:bg-muted/30" onClick={() => router.push(`/workspace/business/${item.username}`)}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                                            <Building className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="truncate text-[15px] font-semibold tracking-tight">{item.name}</h3>
                                            <p className="mt-0.5 text-xs text-muted-foreground">{item.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                </div>
                                <div className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                                    {item.created_at && (
                                        <span>Created on {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            }
        </div>
    );
}
