
"use client";

import type React from "react";
import { Upload, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Facebook01Icon, InstagramIcon, WhatsappIcon, YoutubeIcon, Globe02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

type AppearanceTabProps = {
    profile: Profile;
    isEditing: boolean;
    saving: boolean;
    cropping: boolean;
    logoUrl: string;
    bgUrl: string;
    pending: Partial<Record<CropType, Blob>>;
    setField: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
    setLink: (key: LinkKey, value: string) => void;
    verifyMapsLink: (mapsUrl: string) => Promise<void>;
    selectFile: (file: File | undefined, type: CropType) => void;
    removePendingImage: (type: CropType) => void;
    dropProps: (type: CropType) => {
        onDragOver: (event: React.DragEvent<HTMLLabelElement>) => void;
        onDrop: (event: React.DragEvent<HTMLLabelElement>) => void;
    };
};

const socials = [
    { key: "website", label: "Website", icon: Globe02Icon, placeholder: "https://flexed.in" },
    { key: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: "https://www.instagram.com/..." },
    { key: "whatsapp", label: "WhatsApp", icon: WhatsappIcon, placeholder: "https://wa.me/..." },
    { key: "facebook", label: "Facebook", icon: Facebook01Icon, placeholder: "https://www.facebook.com/..." },
    { key: "youtube", label: "YouTube", icon: YoutubeIcon, placeholder: "https://www.youtube.com/..." },
] as const;

function SectionAccordion({ value, title, description, children }: { value: string; title: string; description: string; children: React.ReactNode }) {
    return (
        <AccordionItem value={value} className="rounded-xl border px-4 bg-muted/20">
            <AccordionTrigger className="py-4 text-left hover:no-underline">
                <div className="space-y-1">
                    <div className="font-semibold">{title}</div>
                    <p className="text-xs font-normal text-muted-foreground">{description}</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">{children}</AccordionContent>
        </AccordionItem>
    );
}

function FormField({ id, label, value, onChange, onBlur, placeholder, type = "text", disabled = false, maxLength }: { id: string; label: string; value: string; onChange?: (value: string) => void; onBlur?: () => void; placeholder?: string; type?: string; disabled?: boolean; maxLength?: number }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type={type} className="h-11" value={value} onChange={event => onChange?.(event.target.value)} onBlur={onBlur} placeholder={placeholder} disabled={disabled} maxLength={maxLength} />
        </div>
    );
}

function AssetUpload({ type, preview, pending, canUpload, selectFile, removePendingImage, dropProps }: { type: CropType; preview: string; pending?: Blob; canUpload: boolean; selectFile: AppearanceTabProps["selectFile"]; removePendingImage: AppearanceTabProps["removePendingImage"]; dropProps: AppearanceTabProps["dropProps"] }) {
    return (
        <div className="min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                    <Label>{type === "logo" ? "Business Logo" : "Background Picture"}</Label>
                    <p className="text-xs text-muted-foreground mb-2">{type === "logo" ? "Square · 1:1" : "Portrait · 9:16"}</p>
                </div>
                {pending && <Button type="button" size="sm" variant="ghost" onClick={() => removePendingImage(type)} disabled={!canUpload}><X className="mr-1 size-3.5" />Discard</Button>}
            </div>
            <label {...(canUpload ? dropProps(type) : {})} className={`group relative flex h-56 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center transition-colors ${canUpload ? "cursor-pointer hover:border-foreground/40 hover:bg-muted/40" : "cursor-not-allowed opacity-60"}`}>
                {preview ? <img src={preview} alt={`${type} preview`} className={`max-h-40 max-w-full rounded-md object-contain ${type === "logo" ? "aspect-square" : "aspect-9/16"}`} /> : <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background"><Upload className="size-5 text-muted-foreground" /></span>}
                <span className="text-sm font-medium">{preview ? `Change ${type}` : `Upload ${type}`}</span>
                <span className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 10 MB</span>
                {pending && <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Unsaved changes</span>}
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={!canUpload} onChange={event => { selectFile(event.target.files?.[0], type); event.target.value = ""; }} />
            </label>
        </div>
    );
}

export default function AppearanceTab({ profile, isEditing, saving, cropping, logoUrl, bgUrl, pending, setField, setLink, verifyMapsLink, selectFile, removePendingImage, dropProps }: AppearanceTabProps) {
    const canEdit = isEditing && !saving;
    const canUpload = canEdit && !cropping;

    return (
        <div className="w-full pt-2">
            <Accordion multiple className="flex w-full flex-col gap-4">
                <SectionAccordion value="assets" title="Assets" description="Personalize your page with your logo and background.">
                    <div className="grid gap-5 md:grid-cols-2">
                        {(["logo", "background"] as const).map(type => <AssetUpload key={type} type={type} preview={type === "logo" ? logoUrl : bgUrl} pending={pending[type]} canUpload={canUpload} selectFile={selectFile} removePendingImage={removePendingImage} dropProps={dropProps} />)}
                    </div>
                </SectionAccordion>
                <SectionAccordion value="identity" title="Identity" description="Your business details and how customers can reach you.">
                    <div className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField id="business-name" label="Business name" value={profile.name} onChange={value => setField("name", value)} placeholder="Your business name" maxLength={120} disabled={!canEdit} />
                            <FormField id="business-username" label="Business username" value={profile.username} placeholder="business-username" disabled />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="business-description">Description</Label>
                                <span className="text-xs tabular-nums text-muted-foreground">{profile.description.length}/100</span>
                            </div>
                            <Textarea id="business-description" className="min-h-14 resize-y" value={profile.description} onChange={event => setField("description", event.target.value)} rows={2} maxLength={100} placeholder="A short introduction to your business." disabled={!canEdit} />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField id="business-email" label="Email address" type="email" maxLength={254} value={profile.email} onChange={value => setField("email", value)} placeholder="hello@example.com" disabled={!canEdit} />
                            <FormField id="business-phone" label="Phone number" type="tel" maxLength={10} value={profile.phone} onChange={value => setField("phone", value)} placeholder="9876543210" disabled={!canEdit} />
                        </div>
                        <FormField id="business-maps" label="Google Maps URL" value={profile.links.maps} onChange={value => setLink("maps", value)} onBlur={() => void verifyMapsLink(profile.links.maps)} placeholder="https://maps.app.goo.gl/..." disabled={!canEdit} />
                    </div>
                </SectionAccordion>
                <SectionAccordion value="socials" title="Socials" description="Connect your online presence to your business page.">
                    <div>
                        {socials.map(({ key, label, icon, placeholder }) => (
                            <div key={key} className="grid gap-3 py-2 first:pt-0 last:pb-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-5">
                                <Label htmlFor={`social-${key}`} className="flex items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/30"><HugeiconsIcon icon={icon} size={17} strokeWidth={1.8} className="text-muted-foreground" /></span>
                                    {label}
                                </Label>
                                <Input id={`social-${key}`} className="h-11 min-w-0" value={profile.links[key]} onChange={event => setLink(key, event.target.value)} placeholder={placeholder} disabled={!canEdit} />
                            </div>
                        ))}
                    </div>
                </SectionAccordion>
            </Accordion>
        </div>
    );
}
