"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, ExternalLink, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/client";
import { toast } from "sonner";
import AppearanceTab from "./studio/appearance-tab";
import VisibilityTab from "./studio/visibility-tab";
import PhonePreview from "./studio/phone-preview";
import { fetchReviewLink } from "./business-cards";
type Social = "instagram" | "website" | "facebook" | "whatsapp" | "youtube";
type LinkKey = Social | "maps" | "reviews";
type CropType = "logo" | "background";
type Profile = {
    name: string;
    username: string;
    description: string;
    email: string;
    phone: string;
    links: Record<LinkKey, string>;
    logoPath: string;
    backgroundPath: string;
};
export type BusinessRow = {
    id: string;
    username: string;
    name: string;
    email: string | null;
    phone: string | null;
    links: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    features: Record<string, unknown> | null;
    assets: Record<string, unknown> | null;
    automation: Record<string, unknown> | null;
};

type ReviewAutomation = {
    tone: string;
    language: string;
    length: string;
    keywords: string[];
    instructions: string
};

type TabValue = "appearance" | "visibility";
const validTabs: TabValue[] = ["appearance", "visibility"];
const defaultReviewAutomation: ReviewAutomation = {
    tone: "Random",
    language: "Random",
    length: "Short",
    keywords: [],
    instructions: "",
};
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_KEYWORDS = 10;
const MAX_KEYWORD_LENGTH = 40;
const BUCKET = "business-assets";
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const defaultLinks: Record<LinkKey, string> = {
    instagram: "",
    website: "",
    facebook: "",
    whatsapp: "",
    youtube: "",
    maps: "",
    reviews: "",
};

function safeUrl(value: string): string | undefined {
    if (!value.trim()) return undefined;
    try {
        const url = new URL(value.trim());
        return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}

function parseRow(row: BusinessRow): Profile {
    const meta = (row.metadata ?? {}) as Record<string, any>;
    const assets = (row.assets ?? {}) as Record<string, unknown>;
    const links = row.links ?? {};
    const parsedLinks = { ...defaultLinks };
    for (const key of Object.keys(parsedLinks) as LinkKey[]) {
        if (typeof links[key] === "string") {
            parsedLinks[key] = links[key] as string;
        }
    }
    return {
        name: row.name ?? "",
        username: row.username ?? "",
        email: row.email ?? "",
        phone: row.phone ?? "",
        description: typeof meta.desc === "string" ? meta.desc : "",
        logoPath: typeof assets.logo_path === "string" ? assets.logo_path : "",
        backgroundPath: typeof assets.bg_path === "string" ? assets.bg_path : "",
        links: parsedLinks,
    };
}

function publicImageUrl(path: string): string {
    if (!path) return "";
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function cropImage(source: string, area: Area): Promise<Blob> {
    const image = new window.Image();
    image.src = source;
    await new Promise<void>((resolve, reject) => {
        if (image.complete && image.naturalWidth > 0) return resolve();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not read image."));
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(area.width);
    canvas.height = Math.round(area.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable.");
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Image export failed.")), "image/webp", 0.88);
    });
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null && "message" in error) return String(error.message);
    return "An unexpected error occurred.";
}

async function uploadBusinessImage(businessCode: string, type: CropType, blob: Blob): Promise<string> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Please sign in again.");
    }
    if (blob.type !== "image/webp") {
        throw new Error("Image must be WebP.");
    }
    if (blob.size > 10 * 1024 * 1024) {
        throw new Error("Image exceeds 10 MB.");
    }
    const filename = `${crypto.randomUUID()}.webp`;
    const path = `${businessCode}/${type}/${filename}`;
    const { data, error } = await supabase.storage
        .from("business-assets")
        .upload(path, blob, {
            contentType: "image/webp",
            cacheControl: "3600",
            upsert: false,
        });
    if (error) {
        console.error("Storage upload failed", { path, message: error.message, statusCode: error.statusCode, error, });
        throw new Error(`Failed to upload ${type}: ${error.message}`);
    }
    return data.path;
}

function parseReviewAutomation(row: BusinessRow): ReviewAutomation {
    const raw = row.automation;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return { ...defaultReviewAutomation, keywords: [] };
    }
    const data = raw as Record<string, unknown>;
    return {
        tone: typeof data.tone === "string" ? data.tone : defaultReviewAutomation.tone,
        language: typeof data.language === "string" ? data.language : defaultReviewAutomation.language,
        length: typeof data.length === "string" ? data.length : defaultReviewAutomation.length,
        instructions: typeof data.instructions === "string" ? data.instructions : "",
        keywords: Array.isArray(data.keywords)
            ? [...new Set(
                data.keywords
                    .filter((item): item is string => typeof item === "string")
                    .map(item => item.trim().replace(/\s+/g, " "))
                    .filter(item => item.length > 0 && item.length <= MAX_KEYWORD_LENGTH)
            )].slice(0, MAX_KEYWORDS)
            : [],
    };
}

export default function ProfileBuilder({ business }: { business: BusinessRow }) {
    const [original, setOriginal] = useState<BusinessRow>(business);
    const [profile, setProfile] = useState<Profile>(() => parseRow(business));
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [cropping, setCropping] = useState(false);
    const [error, setError] = useState("");
    const [cropType, setCropType] = useState<CropType | null>(null);
    const [cropSource, setCropSource] = useState("");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [pixels, setPixels] = useState<Area | null>(null);
    const [pending, setPending] = useState<Partial<Record<CropType, Blob>>>({});
    const [localUrls, setLocalUrls] = useState<Partial<Record<CropType, string>>>({});
    const [automation, setAutomation] = useState<ReviewAutomation>(() => parseReviewAutomation(business));
    const [activeTab, setActiveTab] = useState<TabValue>("appearance");
    const [verifyingMaps, setVerifyingMaps] = useState(false);
    const savingRef = useRef(false);
    const mapsRequestRef = useRef(0);
    const localUrlsRef = useRef<Partial<Record<CropType, string>>>({});
    const fileReaderRef = useRef<FileReader | null>(null);

    const clearLocalUrls = useCallback(() => {
        for (const url of Object.values(localUrlsRef.current)) {
            if (url) URL.revokeObjectURL(url);
        }
        localUrlsRef.current = {};
        setLocalUrls({});
    }, []);

    const closeCrop = useCallback(() => {
        fileReaderRef.current?.abort();
        fileReaderRef.current = null;
        setCropType(null);
        setCropSource("");
        setPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    }, []);

    const changeTab = (value: string) => {
        if (!validTabs.includes(value as TabValue)) return;
        setActiveTab(value as TabValue);
        window.history.pushState(null, "", `#${value}`);
    };

    useEffect(() => {
        const syncTab = () => {
            const hash = window.location.hash.slice(1);
            setActiveTab(validTabs.includes(hash as TabValue) ? hash as TabValue : "appearance");
        };
        syncTab();
        window.addEventListener("hashchange", syncTab);
        return () => window.removeEventListener("hashchange", syncTab);
    }, []);

    useEffect(() => {
        return () => {
            fileReaderRef.current?.abort();
            for (const url of Object.values(localUrlsRef.current)) {
                if (url) URL.revokeObjectURL(url);
            }
        };
    }, []);

    useEffect(() => {
        if (savingRef.current) return;
        setOriginal(business);
        setProfile(parseRow(business));
        setAutomation(parseReviewAutomation(business));
        setPending({});
        clearLocalUrls();
        setIsEditing(false);
        closeCrop();
        setError("");
    }, [business.id, business.username, clearLocalUrls, closeCrop]);

    const logoUrl = localUrls.logo || publicImageUrl(profile.logoPath);
    const bgUrl = localUrls.background || publicImageUrl(profile.backgroundPath);

    const setField = <K extends keyof Profile,>(key: K, value: Profile[K]) => {
        setProfile(previous => ({ ...previous, [key]: value }));
    };

    const setLink = (key: LinkKey, value: string) => {
        if (key === "maps") {
            mapsRequestRef.current += 1;
            setProfile(previous => ({ ...previous, links: { ...previous.links, maps: value, reviews: "" } }));
            return;
        }

        setProfile(previous => ({ ...previous, links: { ...previous.links, [key]: value } }));
    };

    const verifyMapsLink = async (mapsValue: string) => {
        const mapsUrl = mapsValue.trim();
        if (!mapsUrl) return;
        let parsedMapsUrl: URL;
        try {
            parsedMapsUrl = new URL(mapsUrl);
            if (!["http:", "https:"].includes(parsedMapsUrl.protocol)) {
                throw new Error("Invalid protocol");
            }
        } catch {
            toast.error("Enter a valid Google Maps URL.");
            return;
        }
        const requestId = mapsRequestRef.current;
        const toastId = toast.loading("Verifying Google Maps link...");
        setVerifyingMaps(true);
        try {
            const reviewUrl = await fetchReviewLink(parsedMapsUrl);
            if (requestId !== mapsRequestRef.current) {
                toast.dismiss(toastId);
                return;
            }
            setProfile(previous => {
                if (requestId !== mapsRequestRef.current || previous.links.maps.trim() !== mapsUrl) {
                    return previous;
                }
                return { ...previous, links: { ...previous.links, reviews: reviewUrl } };
            });
            toast.success("Google Maps link verified successfully.", { id: toastId });
        } catch (error) {
            if (requestId !== mapsRequestRef.current) {
                toast.dismiss(toastId);
                return;
            }
            toast.error(getErrorMessage(error), { id: toastId });
        } finally {
            if (requestId === mapsRequestRef.current) {
                setVerifyingMaps(false);
            }
        }
    };

    const selectFile = (file: File | undefined, type: CropType) => {
        if (!isEditing || saving || cropping || !file) return;
        if (!allowedImageTypes.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
            toast.error("Use a JPG, PNG, or WebP image under 10 MB.");
            return;
        }
        fileReaderRef.current?.abort();
        setError("");
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setPixels(null);
        const reader = new FileReader();
        fileReaderRef.current = reader;
        reader.onload = () => {
            if (typeof reader.result !== "string") return;
            setCropSource(reader.result);
            setCropType(type);
        };
        reader.onerror = () => toast.error("Unable to read the selected image.");
        reader.readAsDataURL(file);
    };

    const applyCrop = async () => {
        if (!isEditing || !cropType || !pixels || cropping || saving) return;
        setCropping(true);
        try {
            const blob = await cropImage(cropSource, pixels);
            if (blob.size > MAX_IMAGE_SIZE) throw new Error("Cropped image exceeds the 10 MB limit.");
            const nextUrl = URL.createObjectURL(blob);
            const previousUrl = localUrlsRef.current[cropType];
            localUrlsRef.current = { ...localUrlsRef.current, [cropType]: nextUrl };
            setPending(previous => ({ ...previous, [cropType]: blob }));
            setLocalUrls(previous => ({ ...previous, [cropType]: nextUrl }));
            if (previousUrl) requestAnimationFrame(() => URL.revokeObjectURL(previousUrl));
            closeCrop();
            toast.success("Image cropped. Save to upload.");
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setCropping(false);
        }
    };

    const removePendingImage = (type: CropType) => {
        if (!isEditing || saving || cropping) return;
        const previousUrl = localUrlsRef.current[type];
        const nextUrls = { ...localUrlsRef.current };
        delete nextUrls[type];
        localUrlsRef.current = nextUrls;
        setLocalUrls(nextUrls);
        setPending(previous => {
            const next = { ...previous };
            delete next[type];
            return next;
        });
        if (previousUrl) requestAnimationFrame(() => URL.revokeObjectURL(previousUrl));
    };

    const dropProps = (type: CropType) => ({
        onDragOver: (event: React.DragEvent<HTMLLabelElement>) => event.preventDefault(),
        onDrop: (event: React.DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            if (!isEditing || saving || cropping) return;
            selectFile(event.dataTransfer.files[0], type);
        },
    });

    const validateProfile = (): boolean => {
        const name = profile.name.trim();
        const email = profile.email.trim();
        const phone = profile.phone.trim();
        if (!name) {
            toast.error("Business name is required.");
            return false;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Enter a valid email address.");
            return false;
        }
        if (phone && !/^\+?[0-9]{10}$/.test(phone)) {
            toast.error("Phone must contain 10 digits.");
            return false;
        }
        for (const [key, value] of Object.entries(profile.links)) {
            if (value.trim() && !safeUrl(value)) {
                toast.error(`Enter a valid URL for ${key}.`);
                return false;
            }
        }
        return true;
    };

    const save = async () => {
        if (savingRef.current || !isEditing || cropping || verifyingMaps || cropType !== null) {
            return;
        }
        if (!validateProfile()) return;
        savingRef.current = true;
        setSaving(true);
        setError("");
        const toastId = toast.loading("Saving your business profile...");
        const uploadedPaths: string[] = [];
        let databaseUpdated = false;
        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData.user) {
                throw new Error("Session expired. Please sign in again.");
            }
            const userId = authData.user.id;
            const businessUsername = business.username;
            const metadata = {
                ...(original.metadata ?? {}),
                desc: profile.description.trim(),
            };
            const assets = {
                bg_path: original.assets?.bg_path ?? "",
                logo_path: original.assets?.logo_path ?? "",
            };
            if (pending.logo) {
                const logoPath = await uploadBusinessImage(businessUsername, "logo", pending.logo);
                uploadedPaths.push(logoPath);
                assets.logo_path = logoPath;
            }
            if (pending.background) {
                const backgroundPath = await uploadBusinessImage(businessUsername, "background", pending.background);
                uploadedPaths.push(backgroundPath);
                assets.bg_path = backgroundPath;
            }
            const linksPayload: Record<string, unknown> = {
                ...(original.links ?? {}),
            };
            for (const key of Object.keys(profile.links) as LinkKey[]) {
                linksPayload[key] = profile.links[key].trim();
            }
            const payload = {
                name: profile.name.trim(),
                email: profile.email.trim() || null,
                phone: profile.phone.trim() || null,
                links: linksPayload,
                metadata,
                assets,
                automation: {
                    ...automation,
                    keywords: automation.keywords.slice(0, MAX_KEYWORDS),
                },
            };
            const { data: updatedBusiness, error: updateError } = await supabase
                .from("businesses")
                .update(payload)
                .eq("id", business.id)
                .eq("user_id", userId)
                .select("id,name,username,email,phone,links,metadata,assets,features,automation")
                .single();
            if (updateError) {
                { process.env.NODE_ENV === "development" && console.error("Business profile update failed:", { message: updateError.message, details: updateError.details, hint: updateError.hint, code: updateError.code, payload }); }
                toast.error("Failed to update business profile. Please try again.");
                throw updateError;
            }
            if (!updatedBusiness) {
                throw new Error("Business update returned no data.");
            }
            databaseUpdated = true;
            const updated = updatedBusiness as BusinessRow;
            setOriginal(updated);
            setProfile(parseRow(updated));
            setAutomation(parseReviewAutomation(updated));
            setPending({});
            clearLocalUrls();
            setIsEditing(false);
            toast.success("Business profile updated successfully.", { id: toastId });
        } catch (err) {
            if (!databaseUpdated && uploadedPaths.length > 0) {
                try {
                    const { error: cleanupError } = await supabase.storage
                        .from(BUCKET)
                        .remove(uploadedPaths);
                    if (cleanupError) {
                        console.error("Storage cleanup failed:", cleanupError);
                    }
                } catch (cleanupErr) {
                    console.error("Storage cleanup failed:", cleanupErr);
                }
            }
            const message = getErrorMessage(err);
            setError(message);
            toast.error(message, { id: toastId });
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    const startEditing = () => {
        if (saving || cropping) return;
        setIsEditing(true);
        setError("");
    };

    const cancelEditing = () => {
        if (saving || cropping) return;
        setProfile(parseRow(original));
        setPending({});
        clearLocalUrls();
        closeCrop();
        setError("");
        setIsEditing(false);
    };

    return (
        <div className="mx-auto w-full px-4 text-foreground sm:px-6 lg:h-[calc(100dvh-88px)] lg:min-h-0 lg:overflow-hidden lg:px-8">
            <div className="flex min-w-0 flex-col gap-8 lg:h-full lg:min-h-0 lg:flex-row lg:gap-10 xl:gap-14">
                <PhonePreview profile={profile} logoUrl={logoUrl} bgUrl={bgUrl} />
                <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background lg:h-full lg:min-h-0 lg:p-8" aria-label="Profile editor">
                    <Tabs value={activeTab} onValueChange={changeTab} className="mx-auto flex min-h-0 min-w-0 w-full max-w-6xl flex-1 flex-col">
                        {error && <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
                        <header className="flex shrink-0 flex-col gap-5 pb-0 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0 space-y-1.5">
                                {/* <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Business profile</p> */}
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl capitalize">{business.name}</h1>
                                <p className="max-w-lg text-sm leading-6 text-muted-foreground">Shape how your business appears to customers.</p>
                            </div>
                            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                                {isEditing ? (
                                    <>
                                        <Button type="button" variant="outline" onClick={cancelEditing} disabled={saving || cropping} className="flex-1 sm:flex-none"><X className="h-4 w-4" />Cancel</Button>
                                        <Button type="button" onClick={() => void save()} disabled={saving || verifyingMaps ||cropping || cropType !== null} className="flex-1 sm:flex-none">
                                            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Check className="h-4 w-4" />Save</>}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" className="flex-1"><a className="flex justify-center items-center" href={process.env.NODE_ENV === "development" ? `http://localhost:3001/${encodeURIComponent(business.username)}` : `https://flexed.in/${encodeURIComponent(business.username)}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Preview</a></Button>
                                        <Button type="button" onClick={startEditing} disabled={saving || cropping} className="flex-1 sm:flex-none">
                                            <Pencil className="h-4 w-4" />Edit
                                        </Button>
                                    </>
                                )}
                            </div>
                        </header>
                        <div className="shrink-0">
                            <TabsList variant="line" className="gap-5 rounded-none bg-transparent p-0">
                                <TabsTrigger value="appearance" className="gap-2 rounded-none px-1 text-sm font-medium text-muted-foreground transition-colors after:bg-primary data-[state=active]:text-foreground">
                                    Appearance
                                </TabsTrigger>
                                <TabsTrigger value="visibility" className="rounded-none px-1 text-sm font-medium text-muted-foreground transition-colors after:bg-primary data-[state=active]:text-foreground">
                                    Visibility
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
                            <div className="mx-auto w-full max-w-5xl">
                                <TabsContent value="appearance" className="m-0 min-w-0 space-y-2 focus-visible:outline-none">
                                    <AppearanceTab profile={profile} isEditing={isEditing} saving={saving} cropping={cropping} logoUrl={logoUrl} bgUrl={bgUrl} pending={pending} setField={setField} setLink={setLink} verifyMapsLink={verifyMapsLink} selectFile={selectFile} removePendingImage={removePendingImage} dropProps={dropProps} />
                                </TabsContent>
                                <TabsContent value="visibility" className="m-0 min-w-0 space-y-2 focus-visible:outline-none">
                                    <VisibilityTab businessId={business.id} automation={automation} setAutomation={setAutomation} isEditing={isEditing} saving={saving} />
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </section>
            </div>
            <Dialog open={isEditing && cropType !== null} onOpenChange={open => { if (!open && !cropping) closeCrop(); }}>
                <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Crop {cropType === "logo" ? "logo · 1:1" : "background · 16:9"}</DialogTitle>
                    </DialogHeader>
                    <div className="relative h-[min(52vh,430px)] min-h-64 overflow-hidden rounded-xl bg-neutral-950">
                        {cropSource && (
                            <Cropper image={cropSource} crop={crop} zoom={zoom} aspect={cropType === "logo" ? 1 : 9 / 16} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_area, croppedPixels) => setPixels(croppedPixels)} />
                        )}
                    </div>
                    <div className="space-y-3 py-2">
                        <Label>Zoom</Label>
                        <Slider min={1} max={3} step={0.05} value={[zoom]} onValueChange={value => setZoom(Array.isArray(value) ? value[0] : value)} disabled={!isEditing || saving || cropping} />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={closeCrop} disabled={cropping}>Cancel</Button>
                        <Button type="button" className="bg-orange-600 text-white hover:bg-orange-700" onClick={() => void applyCrop()} disabled={!isEditing || saving || cropping || !pixels}>
                            {cropping ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cropping...</> : "Apply"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}