"use client";

import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "flexed-pwa-dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem(DISMISS_KEY) !== "1") {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      localStorage.setItem(DISMISS_KEY, "1");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "dismissed") {
      localStorage.setItem(DISMISS_KEY, "1");
      setDismissed(true);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleInstall}
      className="size-9 rounded-full"
      aria-label="Install app"
    >
      <DownloadIcon className="size-4" />
    </Button>
  );
}
