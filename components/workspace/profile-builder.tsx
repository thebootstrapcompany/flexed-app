"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Star, Upload, Image as ImageIcon, Loader2, ExternalLink, Mail, Phone, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Facebook01Icon, InstagramIcon, WhatsappIcon, YoutubeIcon, Globe02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/client";
import { toast } from "sonner";

type Social = "instagram" | "website" | "facebook" | "whatsapp" | "youtube";
type LinkKey = Social | "maps";
type CropType = "logo" | "background";

type Profile = {
    name: string;
    description: string;
    // slug: string;
    email: string;
    phone: string;
    links: Record<LinkKey, string>;
    logoPath: string;
    backgroundPath: string;
};

export type BusinessRow = {
    code: string;
    name: string;
    // slug: string | null;
    email: string | null;
    phone: string | null;
    links: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
};

type ReviewAutomation = {
    category: string;
    tone: string;
    language: string;
    length: string;
    instructions: string
};

const defaultReviewAutomation: ReviewAutomation = {
    category: "Grocery",
    tone: "Balanced",
    language: "English",
    length: "Medium",
    instructions: "",
};

const BUCKET = "business-assets";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const socials = [
    { key: "website", label: "Website", icon: Globe02Icon, placeholder: 'https://flexed.in' },
    { key: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: 'https://www.instagram.com/...' },
    { key: "whatsapp", label: "WhatsApp", icon: WhatsappIcon, placeholder: 'https://wa.me/...' },
    { key: "facebook", label: "Facebook", icon: Facebook01Icon, placeholder: 'https://www.facebook.com/...' },
    { key: "youtube", label: "YouTube", icon: YoutubeIcon, placeholder: 'https://www.youtube.com/...' }
] as const;

const defaultLinks: Record<LinkKey, string> = {
    instagram: "",
    website: "",
    facebook: "",
    whatsapp: "",
    youtube: "",
    maps: "",
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
    const meta = row.metadata ?? {};
    const links = row.links ?? {};
    const parsedLinks = { ...defaultLinks };
    for (const key of Object.keys(parsedLinks) as LinkKey[]) {
        if (typeof links[key] === "string") parsedLinks[key] = links[key] as string;
    }
    return {
        name: row.name ?? "",
        // slug: row.slug ?? "",
        email: row.email ?? "",
        phone: row.phone ?? "",
        description: typeof meta.desc === "string" ? meta.desc : "",
        logoPath: typeof meta.hero_path === "string" ? meta.hero_path : "",
        backgroundPath: typeof meta.bg_path === "string" ? meta.bg_path : "",
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
        throw new Error("Image exceeds 1 MB.");
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
    const raw = row.metadata?.automation;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return { ...defaultReviewAutomation };
    }
    const data = raw as Record<string, unknown>;
    const result = { ...defaultReviewAutomation };
    for (const key of Object.keys(result) as (keyof ReviewAutomation)[]) {
        if (typeof data[key] === "string") {
            result[key] = data[key] as string;
        }
    }
    return result;
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
    const [phoneTime, setPhoneTime] = useState("9:41");

    const savingRef = useRef(false);
    const localUrlsRef = useRef<Partial<Record<CropType, string>>>({});
    const fileReaderRef = useRef<FileReader | null>(null);
    const cropSourceRef = useRef("");

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
        cropSourceRef.current = "";
        setCropType(null);
        setCropSource("");
        setPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    }, []);

    useEffect(() => {
        const updateTime = () => {
            setPhoneTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false }));
        };
        updateTime();
        const interval = window.setInterval(updateTime, 60000);
        return () => window.clearInterval(interval);
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
    }, [business.code, clearLocalUrls, closeCrop]);

    const logoUrl = localUrls.logo || publicImageUrl(profile.logoPath);
    const bgUrl = localUrls.background || publicImageUrl(profile.backgroundPath);

    const setField = <K extends keyof Profile,>(key: K, value: Profile[K]) => {
        setProfile(previous => ({ ...previous, [key]: value }));
    };

    const setLink = (key: LinkKey, value: string) => {
        setProfile(previous => ({ ...previous, links: { ...previous.links, [key]: value } }));
    };

    const setReviewOption = <K extends keyof ReviewAutomation>(
        key: K,
        value: ReviewAutomation[K]
    ) => {
        setAutomation(previous => ({
            ...previous,
            [key]: value,
        }));
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
            cropSourceRef.current = reader.result;
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
        // const slug = profile.slug.trim();
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
        // if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        //     toast.error("Slug must contain lowercase letters, numbers and hyphens.");
        //     return false;
        // }
        for (const [key, value] of Object.entries(profile.links)) {
            if (value.trim() && !safeUrl(value)) {
                toast.error(`Enter a valid URL for ${key}.`);
                return false;
            }
        }
        return true;
    };

    const save = async () => {
        if (savingRef.current || !isEditing || cropping || cropType !== null) {
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
            const businessCode = business.code;
            const metadata: Record<string, unknown> = {
                ...(original.metadata ?? {}),
                desc: profile.description.trim(),
                automation: { ...automation, instructions: automation.instructions.trim() },
            };
            if (pending.logo) {
                const logoPath = await uploadBusinessImage(businessCode, "logo", pending.logo);
                uploadedPaths.push(logoPath);
                metadata.hero_path = logoPath;
            }
            if (pending.background) {
                const backgroundPath = await uploadBusinessImage(businessCode, "background", pending.background);
                uploadedPaths.push(backgroundPath);
                metadata.bg_path = backgroundPath;
            }
            const payload = {
                name: profile.name.trim(),
                // slug: profile.slug.trim() || null,
                email: profile.email.trim() || null,
                phone: profile.phone.trim() || null,
                links: {
                    ...(original.links ?? {}),
                    ...Object.fromEntries(Object.entries(profile.links).map(([key, value]) => [key, value.trim()])),
                },
                metadata,
            };
            const { data: updatedBusiness, error: updateError } = await supabase
                .from("businesses")
                .update(payload)
                .eq("code", businessCode)
                .eq("user_id", userId)
                .select("code,name,slug,email,phone,links,metadata")
                .single();
            if (updateError) {
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
                const { error: cleanupError } = await supabase.storage
                    .from(BUCKET)
                    .remove(uploadedPaths);
                if (cleanupError) {
                    console.error("Storage cleanup failed:", cleanupError);
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
            <div className="flex min-w-0 flex-col gap-8 lg:h-full lg:min-h-0 lg:flex-row-reverse lg:gap-10 xl:gap-14">
                <section className="flex min-w-0 shrink-0 flex-col items-start justify-center pb-8 lg:h-full lg:w-3/10 lg:self-start" aria-label="Live Touchpoint Preview">
                    <div className="mx-auto w-full max-w-95 rounded-[48px] border-[7px] border-neutral-800 bg-neutral-950 p-1 shadow-[0_20px_70px_-30px_rgba(0,0,0,0.45)] lg:w-[min(100%,calc((100dvh-120px)*9/19.5))] lg:max-w-none">
                        <div className="relative aspect-9/19.5 overflow-hidden rounded-[38px] bg-neutral-900 text-white">
                            {bgUrl ? (
                                <img src={bgUrl} alt="Business background" className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-linear-to-br from-neutral-800 via-neutral-900 to-orange-950" />
                            )}
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/45 via-black/10 to-black/85" />

                            {/* iPhone Status Bar */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex border h-16 items-start justify-between px-[6%] pt-4 text-white">
                                <span className="text-[10px] font-semibold leading-none tracking-tight tabular-nums">
                                    {phoneTime}
                                </span>
                                <div className="flex items-center gap-1">
                                    {/* Cellular Signal */}
                                    <svg width="10" height="8" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
                                        <rect x="0" y="8" width="3" height="4" rx="0.8" />
                                        <rect x="5" y="6" width="3" height="6" rx="0.8" />
                                        <rect x="10" y="3" width="3" height="9" rx="0.8" />
                                        <rect x="15" y="0" width="3" height="12" rx="0.8" />
                                    </svg>
                                    {/* Wi-Fi */}
                                    <svg width="10" height="8" viewBox="0 0 20 15" fill="currentColor" aria-hidden="true">
                                        <path d="M1 4.1C6.1-.2 13.9-.2 19 4.1a1 1 0 0 1 .1 1.4l-.9 1a1 1 0 0 1-1.4.1 10.5 10.5 0 0 0-13.6 0 1 1 0 0 1-1.4-.1l-.9-1A1 1 0 0 1 1 4.1Z" />
                                        <path d="M5 8.4a7.5 7.5 0 0 1 10 0 1 1 0 0 1 .1 1.4l-.9 1a1 1 0 0 1-1.4.1 4.4 4.4 0 0 0-5.6 0 1 1 0 0 1-1.4-.1l-.9-1A1 1 0 0 1 5 8.4Z" />
                                        <path d="M10 14.5 7.8 12a3.2 3.2 0 0 1 4.4 0L10 14.5Z" />
                                    </svg>

                                    {/* Battery */}
                                    <svg width="16" height="10" viewBox="0 0 28 13" fill="none" aria-hidden="true">
                                        <rect x="0.7" y="0.7" width="23" height="11.6" rx="3.3" stroke="white" strokeOpacity="0.7" strokeWidth="1.2" />
                                        <rect x="2.6" y="2.5" width="18.5" height="8" rx="1.8" fill="white" />
                                        <path d="M25.5 4.1c1.3.5 2 1.4 2 2.4s-.7 1.9-2 2.4V4.1Z" fill="white" fillOpacity="0.6" />
                                    </svg>
                                </div>
                            </div>

                            {/* Dynamic Island */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-10 items-start justify-center pt-2">
                                <div className="h-6 w-22 rounded-full bg-black shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
                            </div>

                            {/* Business Information */}
                            <div className="absolute inset-x-0 bottom-0 z-20 m-1 flex max-h-[75%] flex-col overflow-hidden rounded-b-[36px] rounded-t-[20px] border border-white/15 bg-neutral-950/80 shadow-[0_-20px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
                                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/10">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Business logo" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 text-white/50" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="wrap-break-word text-[13px] font-semibold leading-snug tracking-tight">
                                                {profile.name || "Business name"}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="mt-1.5 whitespace-pre-wrap wrap-break-word text-[10px] leading-normal text-neutral-300">
                                        {profile.description || "Your description appears here."}
                                    </p>

                                    {/* Social Links - Hugeicons */}
                                    {socials.some(social => safeUrl(profile.links[social.key])) && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {socials.filter(social => safeUrl(profile.links[social.key])).map(({ key, label, icon }) => (
                                                <a key={key} href={safeUrl(profile.links[key])} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 transition hover:bg-white/20">
                                                    <HugeiconsIcon icon={icon} size={14} strokeWidth={1.8} />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* Contact Links */}
                                    <div className="mt-3 space-y-1.5">
                                        {profile.email && (
                                            <a href={`mailto:${profile.email}`} className="flex min-h-9 items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-2.5 py-1.5 text-[10px] transition hover:bg-white/15">
                                                <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                                                <span className="min-w-0 break-all">{profile.email}</span>
                                            </a>
                                        )}
                                        {profile.phone && (
                                            <a href={`tel:${profile.phone}`} className="flex min-h-9 items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-2.5 py-1.5 text-[10px] transition hover:bg-white/15">
                                                <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                                                <span className="min-w-0 break-all">{profile.phone}</span>
                                            </a>
                                        )}
                                        {safeUrl(profile.links.maps) && (
                                            <a href={safeUrl(profile.links.maps)} target="_blank" rel="noopener noreferrer" className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-semibold text-neutral-950 transition hover:bg-neutral-200">
                                                <Star className="h-3.5 w-3.5" />
                                                Leave a review
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>

                                    <p className="mt-2 text-center text-[9px] text-neutral-400">
                                        powered by <span className="font-semibold text-white">flexd<span className="text-orange-500">.</span></span>
                                    </p>
                                </div>
                            </div>

                            {/* iPhone Home Indicator */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex h-5 items-center justify-center">
                                <div className="h-1 w-24 rounded-full bg-white/90 shadow-sm" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-24 flex min-w-0 flex-1 flex-col p-0 sm:mb-0 sm:px-8 sm:pb-8 lg:h-full lg:min-h-0" aria-label="Profile editor">
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-border bg-card lg:overflow-hidden">
                        <div className="mx-4 sm:mx-6 mt-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 space-y-1">
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Studio</h1>
                                <p className="text-sm text-muted-foreground">
                                    Flex your business{" "}
                                </p>
                            </div>
                            <div className="flex w-full flex-row items-center gap-4 sm:gap-2 sm:w-auto">
                                {isEditing ? (
                                    <>
                                        <Button type="button" variant="outline" onClick={cancelEditing} disabled={saving || cropping} className="h-9 min-w-24 flex-1 sm:flex-none">
                                            Cancel
                                        </Button>
                                        <Button type="button" onClick={() => void save()} disabled={saving || cropping || cropType !== null} className="h-9 min-w-24 flex-1 disabled:cursor-not-allowed sm:flex-none">
                                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save"}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <a href={`https://flexed.in/${encodeURIComponent(business.code)}`} target="_blank" rel="noopener noreferrer" className="w-1/2">
                                            <Button type="button" variant="outline" className="w-full h-9 min-w-24 flex-1 sm:flex-none">
                                                Preview
                                            </Button>
                                        </a>
                                        <Button type="button" onClick={startEditing} disabled={saving || cropping} className="h-9 min-w-24 flex-1 sm:flex-none">
                                            Edit
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <Tabs defaultValue="identity" className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
                            <div className="shrink-0 p-4 pb-0 sm:px-6 sm:py-3 sm:pb-0">
                                <TabsList className="grid h-11 w-full grid-cols-4 items-center gap-1 sm:overflow-hidden rounded-lg bg-muted p-1">
                                    {[
                                        ["identity", "Identity"],
                                        ["assets", "Assets"],
                                        ["socials", "Social"],
                                        ["automation", "Automation"],
                                    ].map(([value, label]) => (
                                        <TabsTrigger key={value} value={value} className="flex h-full min-h-0 min-w-0 w-full items-center justify-center rounded-md px-1 py-0 text-center text-xs font-medium leading-none shadow-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground sm:text-sm">
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                            <div className="min-h-0 flex-1 sm:overflow-y-auto sm:overscroll-contain scrollbar-none [&::-webkit-scrollbar]:hidden">
                                <fieldset disabled={!isEditing || saving} className="min-w-0 border-0 p-0 [&_input:disabled]:cursor-not-allowed [&_textarea:disabled]:cursor-not-allowed">
                                    <TabsContent value="identity" className="m-0 space-y-5 p-4 sm:px-6 sm:py-3">
                                        <div className="flex flex-col gap-5 sm:flex-row">
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <Label htmlFor="business-name">Business name</Label>
                                                <Input id="business-name" className="h-11" value={profile.name} onChange={event => setField("name", event.target.value)} maxLength={120} placeholder="Your business name" />
                                            </div>
                                            {/* <div className="min-w-0 flex-1 space-y-2">
                                                <Label htmlFor="business-slug">Business slug</Label>
                                                <Input id="business-slug" className="h-11" value={profile.slug} onChange={event => setField("slug", event.target.value)} maxLength={120} placeholder="business-slug" />
                                            </div> */}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between gap-2">
                                                <Label htmlFor="business-description">Description</Label>
                                                <span className="text-xs tabular-nums text-muted-foreground">{profile.description.length}/100</span>
                                            </div>
                                            <Textarea id="business-description" className="min-h-28 resize-y" value={profile.description} onChange={event => setField("description", event.target.value)} rows={4} maxLength={100} placeholder="Your description appears here." />
                                        </div>
                                        <div className="flex flex-col gap-5 sm:flex-row">
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <Label htmlFor="business-email">Email</Label>
                                                <Input id="business-email" className="h-11" type="email" value={profile.email} onChange={event => setField("email", event.target.value)} placeholder="hello@example.com" />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <Label htmlFor="business-phone">Phone</Label>
                                                <Input id="business-phone" className="h-11" type="tel" value={profile.phone} onChange={event => setField("phone", event.target.value)} placeholder="9876543210" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="business-maps">Google Maps URL</Label>
                                            <Input id="business-maps" className="h-11" value={profile.links.maps} onChange={event => setLink("maps", event.target.value)} placeholder="https://maps.google.com/..." />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="assets" className="m-0 space-y-5 p-4 sm:p-6">
                                        <div className="flex flex-col gap-5">
                                            {(["logo", "background"] as const).map(type => {
                                                const preview = type === "logo" ? logoUrl : bgUrl;
                                                return (
                                                    <div key={type} className="min-w-0 flex-1 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label>{type === "logo" ? "Business logo · 1:1" : "Background · 9:16"}</Label>
                                                            {pending[type] && (
                                                                <Button type="button" size="sm" variant="ghost" onClick={() => removePendingImage(type)} disabled={!isEditing || saving || cropping}>
                                                                    <X className="mr-1 h-4 w-4" />
                                                                    Discard
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <label {...(isEditing && !saving && !cropping ? dropProps(type) : {})} className={`group flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors ${isEditing && !saving && !cropping ? "cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5" : "cursor-not-allowed opacity-60"}`}>
                                                            {preview ? (
                                                                <img src={preview} alt={`${type} preview`} className={`max-h-36 rounded-lg object-contain ${type === "logo" ? "aspect-square" : "aspect-9/16"}`} />
                                                            ) : (
                                                                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
                                                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                                                </span>
                                                            )}
                                                            <span className="text-sm font-medium">{preview ? `Change ${type}` : `Upload ${type}`}</span>
                                                            <span className="text-xs leading-relaxed text-muted-foreground">Click or drop an image · JPG, PNG, WebP · Max 10 MB</span>
                                                            {pending[type] && <span className="text-xs font-medium text-orange-500">Unsaved image</span>}
                                                            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={!isEditing || saving || cropping} onChange={event => {
                                                                selectFile(event.target.files?.[0], type);
                                                                event.target.value = "";
                                                            }} />
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="socials" className="m-0 space-y-5 p-4 sm:p-6">
                                        {socials.map(({ key, label, icon: Icon, placeholder }) => (
                                            <div key={key} className="grid gap-2 sm:grid-cols-[minmax(0,.15fr)_minmax(0,.85fr)]">
                                                <Label htmlFor={`social-${key}`} className="flex items-center gap-2">
                                                    <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.8} className="text-muted-foreground" />
                                                    {label}
                                                </Label>
                                                <Input id={`social-${key}`} className="h-11" value={profile.links[key]} onChange={event => setLink(key, event.target.value)} placeholder={`${placeholder}`} />
                                            </div>
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="automation" className="m-0 space-y-6 p-4 sm:p-6">
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-sm font-semibold">Tone</Label>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {["Balanced", "Friendly", "Casual", "Simple", "Enthusiastic", "Professional"].map(tone => {
                                                    const selected = automation.tone === tone;
                                                    return (
                                                        <button key={tone} type="button" disabled={!isEditing || saving} onClick={() => setReviewOption("tone", tone)} aria-pressed={selected} className={`min-h-10 rounded-full border px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                                                            {tone}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Language</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {["English", "Hindi", "Hinglish"].map(language => {
                                                    const selected = automation.language === language;
                                                    return (
                                                        <button key={language} type="button" disabled={!isEditing || saving} onClick={() => setReviewOption("language", language)} aria-pressed={selected} className={`min-h-10 rounded-full border px-5 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                                                            {language}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Length</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[{ label: "Short", description: "15–30 words" }, { label: "Medium", description: "30–60 words" }, { label: "Long", description: "60–100 words" }].map(option => {
                                                    const selected = automation.length === option.label;
                                                    return (
                                                        <button key={option.label} type="button" disabled={!isEditing || saving} onClick={() => setReviewOption("length", option.label)} aria-pressed={selected} className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors disabled:opacity-50 cursor-pointer ${selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:bg-accent"}`}>
                                                            <span className="text-sm font-semibold">{option.label}</span>
                                                            <span className="text-[11px] text-muted-foreground">{option.description}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor="review-instructions" className="text-sm font-semibold">Additional Instructions</Label>
                                                <span className="text-xs text-muted-foreground">{automation.instructions.length}/500</span>
                                            </div>
                                            <Textarea id="review-instructions" value={automation.instructions} onChange={event => setReviewOption("instructions", event.target.value)} maxLength={500} rows={3} className="min-h-24 resize-y rounded-xl" placeholder="Example: Keep the language natural and simple. Avoid overly formal expressions." />
                                            <p className="text-xs text-muted-foreground">These preferences will guide AI without changing the customer's actual experience.</p>
                                        </div>
                                    </TabsContent>
                                </fieldset>
                            </div>
                        </Tabs>
                    </div>
                </section>
            </div>

            <Dialog open={isEditing && cropType !== null} onOpenChange={open => {
                if (!open && !cropping) closeCrop();
            }}>
                <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Crop {cropType === "logo" ? "logo · 1:1" : "background · 9:16"}</DialogTitle>
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