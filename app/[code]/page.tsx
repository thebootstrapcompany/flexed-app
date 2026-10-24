import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import BusinessProfileView from "@/components/business/business-profile";
import BusinessUnavailable from "@/components/business/business-unavailable";
import BusinessLoading from "@/components/business/business-loading";
import { supabase } from "@/lib/client";

type PageProps = {
    params: Promise<{ code: string }>;
};

async function BusinessContent({ params }: PageProps) {
    const { code } = await params;
    const { data: business, error } = await supabase
        .from("businesses")
        .select("code,name,slug,email,phone,links,metadata")
        .eq("code", code)
        .maybeSingle();

    if (error) {
        return <BusinessUnavailable reason="error" code={code} />;
    }

    if (!business) return <BusinessUnavailable reason="not-found" code={code} />;

    const metadata = business.metadata ?? {};
    const links = business.links ?? {};
    const storageUrl = (path: unknown) => {
        if (typeof path !== "string" || !path) return "";
        return supabase.storage.from("business-assets").getPublicUrl(path).data.publicUrl;
    };

    return (
        <BusinessProfileView
            business={{
                name: business.name,
                description: typeof metadata.desc === "string" ? metadata.desc : "",
                logo: storageUrl(metadata.hero_path),
                background: storageUrl(metadata.bg_path),
                email: business.email ?? "",
                phone: business.phone ?? "",
                links: {
                    instagram: links.instagram ?? "",
                    facebook: links.facebook ?? "",
                    whatsapp: links.whatsapp ?? "",
                    youtube: links.youtube ?? "",
                    website: links.website ?? "",
                    maps: links.maps ?? "",
                    reviews: metadata.reviews ?? links.reviews ?? ""
                },
                metadata: { automation: metadata.automation ?? {} }
            }}
        />
    );
}

export default function BusinessPage({ params }: PageProps) {
    return (
        <Suspense fallback={<BusinessLoading />}>
            <BusinessContent params={params} />
        </Suspense>
    );
}