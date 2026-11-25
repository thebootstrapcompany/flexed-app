"use client";

import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ScanPage from "./scanner";

interface TouchpointDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    businessId: string;
    onCreated?: () => void;
}

export function TouchpointDrawer({ open, onOpenChange, businessId, onCreated }: TouchpointDrawerProps) {
    const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");
        const update = () => setIsDesktop(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    const handleOpenChange = (value: boolean) => {
        if (submitting) return;
        onOpenChange(value);
        if (!value) { setName(""); setError(null); }
    };

    const submitButton = <Button type="submit" className="w-1/2" disabled={submitting || !name.trim()}>
        {submitting && <Loader2 className="size-4 animate-spin" />}{submitting ? "Creating..." : "Create Touchpoint"}
    </Button>;

    if (isDesktop === null) return null;

    if (isDesktop) {
        return (
            <Drawer swipeDirection="right" open={open} onOpenChange={handleOpenChange}>
                <DrawerContent className="">
                    <DrawerHeader className="border-b">
                        <DrawerTitle>Create Touchpoint</DrawerTitle>
                        <DrawerDescription>Create a new touchpoint for your business.</DrawerDescription>
                    </DrawerHeader>
                    <ScanPage businessId={businessId} />
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Drawer showSwipeHandle open={open} onOpenChange={handleOpenChange}>
            <DrawerContent className="flex max-h-[95dvh] min-h-[45dvh] flex-col pb-20">
                {/* <DrawerHeader className="text-left">
                    <DrawerTitle>Create Touchpoint</DrawerTitle>
                    <DrawerDescription>Create a new touchpoint for your business.</DrawerDescription>
                </DrawerHeader> */}
                <ScanPage businessId={businessId} />
                {/* <DrawerFooter className="pt-4 border-t mb-20">
                    <DrawerClose className="flex items-center justify-center gap-2">
                        {submitButton}
                        <Button type="button" variant="outline" className="w-1/2" disabled={submitting}>Cancel</Button>
                    </DrawerClose>
                </DrawerFooter> */}
            </DrawerContent>
        </Drawer>
    );
}