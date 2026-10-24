"use client";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

async function cropImage(src: string, area: Area, aspect: number): Promise<Blob> {
    const image = new Image(); image.src = src; await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = aspect === 1 ? 512 : 540;
    canvas.height = aspect === 1 ? 512 : 960;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Crop failed")), "image/webp", .88));
}

export function ImageCropDialog({ src, aspect, onClose, onApply }: { src: string | null; aspect: number; onClose: () => void; onApply: (blob: Blob) => Promise<void> }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);
    const [busy, setBusy] = useState(false);
    const complete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

    return <Dialog open={!!src} onOpenChange={open => { if (!open && !busy) onClose(); }}>
        <DialogContent className="max-w-md rounded-3xl border-white/15 bg-zinc-950 text-white">
            <DialogHeader>
                <DialogTitle>Crop image · {aspect === 1 ? "1:1" : "9:16"}</DialogTitle>
            </DialogHeader>
            <div className="relative h-85 overflow-hidden rounded-xl bg-black">
                {src &&
                    <Cropper image={src} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={complete} />
                }
            </div>
            <label className="text-xs text-zinc-400">Zoom</label>
            <Slider min={1} max={3} step={.05} value={[zoom]} onValueChange={(value) => { setZoom(Array.isArray(value) ? value[0] : value) }} />
            <Button
                disabled={!area || busy}
                onClick={
                    async () => {
                        if (!src || !area) return;
                        setBusy(true);
                        try {
                            await onApply(await cropImage(src, area, aspect));
                            onClose();
                        } finally {
                            setBusy(false);
                        }
                    }}>
                {busy ? "Uploading…" : "Apply crop"}
            </Button>
        </DialogContent>
    </Dialog>;
}
