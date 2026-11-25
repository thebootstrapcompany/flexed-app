"use client";

import { useRef, useState, type FormEvent } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, ScanLine, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";

const QR_HOSTS = new Set(["flexed.in", "www.flexed.in"]);
// const CODE_REGEX = /^[A-Z0-9]{5, 6}$/;

type Step = "scan" | "checking" | "form" | "submitting" | "success";

function extractCode(value: string): string | null {
    try {
        const url = new URL(value.trim());
        if (url.protocol !== "https:" || !QR_HOSTS.has(url.hostname) || url.search || url.hash) return null;
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length !== 1) return null;
        const code = segments[0].toUpperCase();
        // return CODE_REGEX.test(code) ? code.toLowerCase() : null;
        return code.toLowerCase() ?? null;
    } catch {
        return null;
    }
}

export default function ScanPage({ businessId }: { businessId: string }) {
    const [step, setStep] = useState<Step>("scan");
    const [error, setError] = useState("");
    const [code, setCode] = useState<string | null>(null);
    const [variantType, setVariantType] = useState('');
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const scanLock = useRef(false);
    const requestId = useRef(0);
    const submitLock = useRef(false);

    function cancelCamera() {
        requestId.current += 1;
        scanLock.current = true;
        setCameraEnabled(false);
        setStep("scan");
        setError("");
        setCode(null);
    }

    function startCamera() {
        scanLock.current = false;
        setCameraEnabled(true);
        setError("");
        setCode(null);
        setStep("scan");
    }

    const checkCode = async (value: string) => {
        const id = ++requestId.current;
        setStep("checking");
        setError("");
        try {
            const { data, error } = await supabase.rpc("check_touchpoint_code", {
                p_code: value.trim().toLowerCase(),
            });
            if (id !== requestId.current) return;
            if (error) throw error;
            if (!data?.success) {
                throw new Error(data?.message ?? "Unable to verify touchpoint.");
            }
            console.log(data)
            setCode(data.data.code);
            setVariantType(data.data.variant_type);
            setStep("form");
        } catch (err) {
            if (id !== requestId.current) return;
            setError(err instanceof Error ? err.message : "Unable to verify touchpoint. Please try again.");
            setStep("scan");
        }
    };

    const handleScan = (results: { rawValue: string }[]) => {
        if (scanLock.current || !results.length) return;
        scanLock.current = true;
        const extracted = extractCode(results[0].rawValue);
        console.log(extracted)
        if (!extracted) {
            setError("Invalid Touchpoint code. Scan a valid Flexed Touchpoint code.");
            return;
        }
        setCameraEnabled(false);
        void checkCode(extracted);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!code || submitLock.current) return;
        submitLock.current = true;
        setStep("submitting");
        setError("");
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error("Please sign in to activate this Touchpoint.");
            }
            const { name, email, phone } = form;
            if (!name.trim()) throw new Error("Business Name is required.");
            const response = await supabase.from("touchpoints").insert({
                code: code,
                user_id: user.id,
                business_id: businessId,
                status: "active",
                metadata: {
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                }
            });
            if (error) throw error;
            setStep("success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to activate Touchpoint.");
            setStep("form");
        } finally {
            submitLock.current = false;
        }
    };

    function resetScanner() {
        requestId.current += 1;
        scanLock.current = false;
        setCameraEnabled(true);
        setStep("scan");
        setError("");
        setCode(null);
        setForm({ name: "", email: "", phone: "" });
    }

    return (
        <main className="mx-auto flex w-full items-start justify-center p-4 sm:px-6">
            <div className={`w-full ${step === "form" || step === "submitting" ? "max-w-3xl" : "max-w-sm"}`}>
                <div className="mb-4 space-y-2 text-center">
                    <h1 className="text-lg font-semibold tracking-tight">{step === "form" || step === "submitting" ? "Register Business" : step === "success" ? "Activation Complete" : "Scan Touchpoint"}</h1>
                    <p className="text-xs text-muted-foreground">{step === "form" || step === "submitting" ? "Enter your business details to activate this Touchpoint." : step === "success" ? "Your Touchpoint has been activated successfully." : "Scan your Flexed Touchpoint to get started."}</p>
                </div>
                {(step === "scan" || step === "checking") && (
                    <div className="rounded-xl border bg-card p-3">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
                            {step === "scan" && cameraEnabled && !error && (
                                <>
                                    <Scanner constraints={{ facingMode: "environment" }} formats={["qr_code"]} onScan={handleScan} onError={(err) => { scanLock.current = true; setError("Camera unavailable. Check camera permissions."); }} components={{ finder: false }} styles={{ container: { width: "100%", height: "100%" }, video: { width: "100%", height: "100%", objectFit: "cover" } }} />
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="relative aspect-square w-[72%]">
                                            <div className="absolute left-0 top-0 size-9 rounded-tl-xl border-l-4 border-t-4 border-white" />
                                            <div className="absolute right-0 top-0 size-9 rounded-tr-xl border-r-4 border-t-4 border-white" />
                                            <div className="absolute bottom-0 left-0 size-9 rounded-bl-xl border-b-4 border-l-4 border-white" />
                                            <div className="absolute bottom-0 right-0 size-9 rounded-br-xl border-b-4 border-r-4 border-white" />
                                            <div className="absolute inset-x-3 top-1/2 h-px animate-pulse bg-white/80" />
                                        </div>
                                    </div>
                                </>
                            )}
                            {step === "checking" && (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
                                    <Loader2 className="size-8 animate-spin" />
                                    <p className="text-sm">Verifying Touchpoint...</p>
                                </div>
                            )}
                            {step === "scan" && !cameraEnabled && !error && (
                                <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
                                    <QrCode className="size-10 text-white/60" />
                                    <p className="text-sm text-white/70">Camera is turned off</p>
                                </div>
                            )}
                            {step === "scan" && error && (
                                <div className="flex h-full flex-col items-center justify-center gap-4 p-5 text-center text-white">
                                    <QrCode className="size-9" />
                                    <p className="text-sm">{error}</p>
                                    <Button variant="secondary" size="sm" onClick={startCamera}><RefreshCw className="size-4" />Try Again</Button>
                                </div>
                            )}
                        </div>
                        {step === "scan" && cameraEnabled && !error && (
                            <Button type="button" variant="outline" className="mt-3 w-full" onClick={cancelCamera}>Cancel Camera</Button>
                        )}
                        {step === "scan" && cameraEnabled && !error && (
                            <Button type="button" variant="outline" className="mt-3 w-full" onClick={startCamera}>Enable Camera</Button>
                        )}
                        {step === "scan" && cameraEnabled && !error && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <ScanLine className="size-4" />
                                Position Touchpoint inside the frame
                            </div>
                        )}
                    </div>
                )}
                {(step === "form" || step === "submitting") && (
                    <div className="rounded-xl border bg-card p-5 sm:p-6">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <QrCode className="size-5" />
                                <span className="font-mono text-sm font-medium">{code?.toUpperCase()}</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <CheckCircle2 className="size-4" />
                                Available
                            </span>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium mb-2">Touchpoint Name</label>
                                    <Input id="name" placeholder="Flexed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required disabled={step === "submitting"} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Touchpoint Type</label>
                                    <Input placeholder="card" value={variantType} disabled />
                                </div>
                            </div>
                            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                            <div className="flex gap-3 border-t pt-5">
                                <Button type="button" variant="outline" className="flex-1" onClick={resetScanner} disabled={step === "submitting"}>Back</Button>
                                <Button type="submit" className="flex-1" disabled={step === "submitting"}>
                                    {step === "submitting" ? <><Loader2 className="size-4 animate-spin" />Activating...</> : <>Activate</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
                {step === "success" && (
                    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
                        <CheckCircle2 className="size-12 text-emerald-600" />
                        <h2 className="text-xl font-semibold">Touchpoint Activated</h2>
                        <p className="text-sm text-muted-foreground">{form.name} has been successfully registered.</p>
                        <Button variant="outline" onClick={resetScanner}>Go to Workspace</Button>
                    </div>
                )}
            </div>
        </main>
    );
}