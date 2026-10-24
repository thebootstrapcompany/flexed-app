"use client";
import { Instagram, Globe, Facebook, Youtube, MessageCircle, MapPin, Star, Mail, Phone } from "lucide-react";
import { type Profile, visibilityOf, safeUrl, platforms, type Visibility } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
const icons = {instagram:Instagram,website:Globe,facebook:Facebook,whatsapp:MessageCircle,youtube:Youtube};
export function BusinessProfilePreview({profile, visibility, logoUrl, backgroundUrl}: {profile:Profile; visibility?:Visibility; logoUrl?:string|null; backgroundUrl?:string|null}) {
 const v=visibility??visibilityOf(profile);
 const supabase=createClient();
 const getUrl=(path:unknown)=> typeof path === "string" && path ? supabase.storage.from("business-assets").getPublicUrl(path).data.publicUrl : null;
 const bg=backgroundUrl===undefined?getUrl(profile.metadata.bg_path):backgroundUrl;
 const logo=logoUrl===undefined?getUrl(profile.metadata.hero_path):logoUrl;
 const desc=typeof profile.metadata.desc === "string"?profile.metadata.desc:"";
 const link=(key:string)=>safeUrl(profile.links[key]);
 return <div className="relative mx-auto aspect-[9/16] w-full max-w-[390px] overflow-hidden rounded-[32px] border border-white/15 bg-zinc-900 text-white shadow-2xl">
 {bg && <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${JSON.stringify(bg).slice(1,-1)})`}}/>}
 <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"/>
 <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-white/15 bg-black/35 px-4 py-1 text-xs font-medium backdrop-blur-xl">flexd<span className="text-orange-500">.</span></div>
 <div className="absolute inset-x-0 bottom-0 rounded-t-[32px] border-t border-white/20 bg-zinc-900/70 p-5 pb-6 shadow-[0_-20px_80px_rgba(0,0,0,.25)] backdrop-blur-3xl supports-[backdrop-filter]:bg-zinc-900/60">
 <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-white/40"/>
 <div className="flex items-center gap-3">{v.logo && <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-zinc-800">{logo?<img src={logo} alt="Business logo" className="h-full w-full object-cover"/>:<span className="text-xl font-semibold">{profile.name.slice(0,1)}</span>}</div>}<div className="min-w-0">{v.name&&<h2 className="truncate text-lg font-semibold">{profile.name}</h2>}{v.description&&<p className="mt-1 text-xs leading-relaxed text-zinc-300">{desc}</p>}</div></div>
 {v.socials&&<div className="mt-4 flex flex-wrap gap-2">{platforms.map(p=>{const url=link(p);if(!url)return null;const Icon=icons[p];return <a key={p} href={url} target="_blank" rel="noopener noreferrer" aria-label={p} className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20"><Icon size={17}/></a>})}</div>}
 {v.email&&profile.email&&<a className="mt-3 flex items-center gap-2 text-xs text-zinc-200" href={`mailto:${profile.email}`}><Mail size={14}/>{profile.email}</a>}
 {v.phone&&profile.phone&&<a className="mt-3 flex items-center gap-2 text-xs text-zinc-200" href={`tel:${profile.phone}`}><Phone size={14}/>{profile.phone}</a>}
 {v.review&&link("review")&&<a href={link("review")!} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black"><Star size={16}/>Leave a review</a>}
 {v.maps&&link("maps")&&<a href={link("maps")!} target="_blank" rel="noopener noreferrer" className="mt-3 flex h-20 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 text-sm"><MapPin size={17}/>View on Maps</a>}
 <p className="mt-4 text-center text-[11px] text-zinc-400">powered by <span className="font-semibold text-white">flexd<span className="text-orange-500">.</span></span></p>
 </div></div>;
}
