"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    InstagramIcon,
    Facebook01Icon,
    WhatsappIcon,
    YoutubeIcon,
    Globe02Icon,
    Mail01Icon,
    Call02Icon,
    StarIcon,
    LinkSquare01Icon,
    Image01Icon,
} from "@hugeicons/core-free-icons";

type SocialKey = "instagram" | "facebook" | "whatsapp" | "youtube" | "website";

type BusinessProfile = {
    name: string;
    description: string;
    logo: string;
    background: string;
    email: string;
    phone: string;
    links: Record<SocialKey | "maps" | "reviews", string>;
    metadata: { automation: Record<string, unknown> };
};

const socials = [
    {
        key: "website",
        label: "Website",
        icon: Globe02Icon,
    },
    {
        key: "instagram",
        label: "Instagram",
        icon: InstagramIcon,
    },
    {
        key: "whatsapp",
        label: "WhatsApp",
        icon: WhatsappIcon,
    },
    {
        key: "facebook",
        label: "Facebook",
        icon: Facebook01Icon,
    },
    {
        key: "youtube",
        label: "YouTube",
        icon: YoutubeIcon,
    },
] as const;

function safeUrl(value: string): string | undefined {
    if (!value?.trim()) return undefined;
    try {
        const url = new URL(value.trim());
        return ["https:", "http:"].includes(url.protocol) ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}

export default function BusinessProfileView({ business }: { business: BusinessProfile }) {
    const [pageUrl, setPageUrl] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        setPageUrl(window.location.href);
    }, []);

    const handleLeaveReview = async () => {
        if (reviewLoading) return;
        const validMapsUrl = safeUrl(business.links.reviews);
        if (!validMapsUrl) return;
        setReviewLoading(true);
        try {
            const response = await fetch("/api/generate-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ business })
            });
            if (!response.ok) throw new Error("Failed to generate review.");
            const { review } = await response.json();
            if (typeof review !== "string" || !review.trim()) throw new Error("Invalid generated review.");
            const finalReview = review.trim();
            try {
                await navigator.clipboard.writeText(finalReview);
                console.log("Review copied to clipboard!");
            } catch (error) {
                console.error("Clipboard error:", error);
                alert("Automatic copy failed. Please copy the generated review manually.");
                return;
            }
            window.location.assign(validMapsUrl);
        } catch (error) {
            console.error("Review generation error:", error);
        } finally {
            setReviewLoading(false);
        }
    };

    return (
        <main className="min-h-dvh w-full bg-neutral-800 sm:bg-neutral-700">
            <div className="relative isolate mx-auto flex min-h-dvh w-full max-w-140 flex-col overflow-hidden bg-neutral-950 text-white sm:shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
                {/* Background */}
                <div className="absolute inset-0 -z-10">
                    {business.background ? (
                        <img src={business.background} alt="" className="h-full w-full object-cover object-center" />
                    ) : (
                        <div className="h-full w-full bg-linear-to-br from-neutral-800 via-neutral-900 to-orange-950" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 to-black/85" />
                </div>
                <div className="min-h-20 flex-1 sm:min-h-28" />

                {/* Business Information */}
                <section aria-label="Business information" className="relative z-10 m-2 rounded-[32px] border border-white/15 bg-neutral-950/80 shadow-[0_-20px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl" >
                    <div className="p-4 sm:px-8">
                        {/* Business Logo and Name */}
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 sm:h-20 sm:w-20">
                                {business.logo ? (
                                    <img src={business.logo} alt={`${business.name} logo`} className="h-full w-full object-cover" />
                                ) : (
                                    <HugeiconsIcon icon={Image01Icon} size={20} strokeWidth={1.8} />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h1 className="wrap-break-word text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                                    {business.name}
                                </h1>
                            </div>
                        </div>
                        {business.description && (
                            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-neutral-300">
                                {business.description}
                            </p>
                        )}

                        {/* Social Links */}
                        {socials.some(({ key }) => safeUrl(business.links[key])) && (
                            <div className="mt-4 flex flex-wrap gap-3">
                                {socials.filter(({ key }) => safeUrl(business.links[key]))
                                    .map(({ key, label, icon: Icon }) => (
                                        <a key={key} href={safeUrl(business.links[key])} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
                                            <HugeiconsIcon icon={Icon} size={20} strokeWidth={1.8} />
                                        </a>
                                    ))}
                            </div>
                        )}

                        {/* Contact and Review Links */}
                        <div className="mt-6 space-y-3">
                            {business.email && (
                                <a href={`mailto:${business.email}`} className="flex min-h-12 items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/15" >
                                    <HugeiconsIcon icon={Mail01Icon} size={20} />
                                    <span className="min-w-0 break-all">
                                        {business.email}
                                    </span>
                                </a>
                            )}

                            {business.phone && (
                                <a href={`tel:${business.phone}`} className="flex min-h-12 items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/15" >
                                    <HugeiconsIcon icon={Call02Icon} size={20} />
                                    <span className="min-w-0 break-all">
                                        {business.phone}
                                    </span>
                                </a>
                            )}

                            {/* Google Review Button */}
                            {safeUrl(business.links.maps) && (
                                <button type="button" onClick={handleLeaveReview} disabled={reviewLoading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-60" >
                                    <HugeiconsIcon icon={StarIcon} size={20} />
                                    {reviewLoading ? "Opening review page..." : "Leave a review"}
                                    {!reviewLoading && (
                                        <HugeiconsIcon icon={LinkSquare01Icon} size={16} />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Footer */}
                        <footer className="mt-4 text-center">
                            <p className="text-xs text-neutral-400">
                                powered by{" "}
                                <a href="https://flexed.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-white">
                                    flexd
                                    <span className="text-orange-500">.</span>
                                </a>
                            </p>
                        </footer>
                    </div>
                </section>
            </div>

            {/* Mobile QR Area */}
            {pageUrl && (
                <aside aria-label="View profile on mobile" className="fixed bottom-8 right-8 hidden flex-col items-center gap-2 text-white xl:flex">
                    <p className="text-sm font-medium">
                        View on mobile
                    </p>
                    <div className="rounded-xl bg-white p-2 shadow-lg">
                        {/* Add QRCodeSVG here if needed */}
                    </div>
                </aside>
            )}
        </main>
    );
}