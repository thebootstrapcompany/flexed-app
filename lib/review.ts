
export async function getGoogleReviewUrl(
    mapsUrl: string
): Promise<string> {
    if (!mapsUrl?.trim()) return "";

    try {
        const url = new URL(mapsUrl.trim());

        const allowedHosts = [
            "google.com",
            "www.google.com",
            "maps.google.com",
            "maps.app.goo.gl",
            "search.google.com",
            "goo.gl",
        ];

        if (
            url.protocol !== "https:" ||
            !allowedHosts.includes(url.hostname)
        ) {
            return "";
        }

        const extractPlaceId = (value: string): string => {
            let decoded = value;

            try {
                decoded = decodeURIComponent(value);
            } catch {
                // Keep original value
            }

            const patterns = [
                /[?&](?:placeid|place_id|query_place_id)=([A-Za-z0-9_-]{10,})/i,
                /!1s(ChIJ[A-Za-z0-9_-]{15,})/,
                /(?:place_id|placeId)["']?\s*[:=]\s*["']?(ChIJ[A-Za-z0-9_-]+)/i,
            ];

            for (const pattern of patterns) {
                const match = decoded.match(pattern);
                if (match) return match[1];
            }

            return "";
        };

        // 1. Extract directly from input URL
        let placeId = extractPlaceId(url.toString());

        // 2. Attempt to resolve short URL
        if (!placeId && url.hostname === "maps.app.goo.gl") {
            try {
                const response = await fetch(url.toString(), {
                    method: "GET",
                    redirect: "follow",
                    signal: AbortSignal.timeout(7000),
                });

                if (response.ok) {
                    placeId = extractPlaceId(response.url);

                    if (!placeId) {
                        const html = await response.text();
                        placeId = extractPlaceId(html);
                    }
                }
            } catch {
                // Google often blocks browser-side fetch via CORS
            }
        }

        // 3. Generate Google review URL
        if (placeId) {
            return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
        }

        // 4. Fallback to original Maps URL
        return url.toString();
    } catch {
        return "";
    }
}
