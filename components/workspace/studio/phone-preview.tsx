
"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Image as ImageIcon, Mail, Phone, Star } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Facebook01Icon, InstagramIcon, WhatsappIcon, YoutubeIcon, Globe02Icon } from "@hugeicons/core-free-icons";

type PreviewProfile = {
    name: string;
    description: string;
    email: string;
    phone: string;
    links: Record<string, string>;
};

type PhonePreviewProps = {
    profile: PreviewProfile;
    logoUrl: string;
    bgUrl: string;
};

const socials = [
    { key: "website", label: "Website", icon: Globe02Icon },
    { key: "instagram", label: "Instagram", icon: InstagramIcon },
    { key: "whatsapp", label: "WhatsApp", icon: WhatsappIcon },
    { key: "facebook", label: "Facebook", icon: Facebook01Icon },
    { key: "youtube", label: "YouTube", icon: YoutubeIcon },
] as const;

function safeUrl(value: string): string | undefined {
    if (!value.trim()) return undefined;

    try {
        const url = new URL(value.trim());
        return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}

export default function PhonePreview({ profile, logoUrl, bgUrl }: PhonePreviewProps) {
    console.log(bgUrl, logoUrl)
    const [phoneTime, setPhoneTime] = useState("9:41");

    useEffect(() => {
        const updateTime = () => setPhoneTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false }));
        updateTime();
        const interval = window.setInterval(updateTime, 60000);
        return () => window.clearInterval(interval);
    }, []);

    const socialLinks = socials.map(social => ({ ...social, url: safeUrl(profile.links[social.key] ?? "") })).filter(social => social.url);
    const reviewsUrl = safeUrl(profile.links.reviews ?? "");

    return (
        <section className="hidden min-w-0 shrink-0 flex-col items-center justify-center pb-8 md:flex md:w-[min(38vw,22rem)] lg:h-full lg:w-[min(30%,22rem)] lg:self-start" aria-label="Live Business Preview">
            <div className="relative mx-auto w-full max-w-95 lg:w-[min(100%,calc((100dvh-120px)*9/19.5))] lg:max-w-none">
                <div className="pointer-events-none absolute -left-2.25 top-22.5 z-50 flex flex-col gap-3">
                    <div className="h-8 w-0.75 rounded-l-full border border-neutral-700 bg-neutral-600 shadow-[-2px_0_4px_rgba(0,0,0,0.3)]" />
                    <div className="h-10 w-0.75 rounded-l-full border border-neutral-700 bg-neutral-600 shadow-[-2px_0_4px_rgba(0,0,0,0.3)]" />
                    <div className="h-10 w-0.75 rounded-l-full border border-neutral-700 bg-neutral-600 shadow-[-2px_0_4px_rgba(0,0,0,0.3)]" />
                </div>
                <div className="pointer-events-none absolute -right-2.25 top-31.25 z-50 h-16 w-0.75 rounded-r-full border border-neutral-700 bg-neutral-600 shadow-[2px_0_4px_rgba(0,0,0,0.3)]" />
                <div className="rounded-[48px] border-[7px] border-neutral-800 bg-neutral-950 p-1 shadow-[0_20px_70px_-30px_rgba(0,0,0,0.45)]">
                    <div className="relative aspect-9/19.5 overflow-hidden rounded-[38px] bg-neutral-900 text-white">
                        {bgUrl ?? <img src={bgUrl} alt="Business background" className="absolute inset-0 h-full w-full object-cover" />}
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-black/10 to-black/85" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-10 items-start justify-center pt-2">
                            <div className="relative flex h-6.25 w-23 items-center justify-end rounded-full bg-black px-2 shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
                                <div className="h-2 w-2 rounded-full border border-neutral-800 bg-[#10141d] shadow-inner" />
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-12 items-start justify-between px-[6%] pt-4 text-white">
                            <span className="text-[10px] font-semibold leading-none tracking-tight tabular-nums">{phoneTime}</span>
                            <div className="flex items-center gap-1.5">
                                <svg width="12" height="10" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
                                    <rect x="0" y="8" width="3" height="4" rx="0.8" />
                                    <rect x="5" y="6" width="3" height="6" rx="0.8" />
                                    <rect x="10" y="3" width="3" height="9" rx="0.8" />
                                    <rect x="15" y="0" width="3" height="12" rx="0.8" />
                                </svg>
                                <svg width="12" height="10" viewBox="0 0 20 15" fill="currentColor" aria-hidden="true">
                                    <path d="M1 4.1C6.1-.2 13.9-.2 19 4.1a1 1 0 0 1 .1 1.4l-.9 1a1 1 0 0 1-1.4.1 10.5 10.5 0 0 0-13.6 0 1 1 0 0 1-1.4-.1l-.9-1A1 1 0 0 1 1 4.1Z" />
                                    <path d="M5 8.4a7.5 7.5 0 0 1 10 0 1 1 0 0 1 .1 1.4l-.9 1a1 1 0 0 1-1.4.1 4.4 4.4 0 0 0-5.6 0 1 1 0 0 1-1.4-.1l-.9-1A1 1 0 0 1 5 8.4Z" />
                                    <path d="M10 14.5 7.8 12a3.2 3.2 0 0 1 4.4 0L10 14.5Z" />
                                </svg>
                                <svg width="17" height="10" viewBox="0 0 28 13" fill="none" aria-hidden="true">
                                    <rect x="0.7" y="0.7" width="23" height="11.6" rx="3.3" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" />
                                    <rect x="2.6" y="2.5" width="18.5" height="8" rx="1.8" fill="white" />
                                    <path d="M25.5 4.1c1.3.5 2 1.4 2 2.4s-.7 1.9-2 2.4V4.1Z" fill="white" fillOpacity="0.7" />
                                </svg>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-24 bg-linear-to-b from-black/30 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 z-20 m-1 flex max-h-[75%] flex-col overflow-hidden rounded-b-[36px] rounded-t-[20px] border border-white/15 bg-neutral-950/80 shadow-[0_-20px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-5 scrollbar-none [&::-webkit-scrollbar]:hidden">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/10">
                                        {logoUrl ? <img src={logoUrl} alt="Business logo" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-white/50" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="wrap-break-word text-[13px] font-semibold leading-snug tracking-tight">{profile.name || "Business name"}</h3>
                                    </div>
                                </div>
                                <p className="mt-1.5 whitespace-pre-wrap wrap-break-word text-[10px] leading-normal text-neutral-300">{profile.description || "Your description appears here."}</p>
                                {socialLinks.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {socialLinks.map(({ key, label, icon, url }) => (
                                            <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 transition hover:bg-white/20">
                                                <HugeiconsIcon icon={icon} size={14} strokeWidth={1.8} />
                                            </a>
                                        ))}
                                    </div>
                                )}
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
                                    {reviewsUrl && (
                                        <a href={reviewsUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-semibold text-neutral-950 transition hover:bg-neutral-200">
                                            <Star className="h-3.5 w-3.5" />
                                            Leave a review
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                                <p className="mt-2 text-center text-[9px] text-neutral-400">powered by <span className="font-semibold text-white">flexd<span className="text-orange-500">.</span></span></p>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex h-5 items-center justify-center">
                            <div className="h-1 w-24 rounded-full bg-white/90 shadow-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}