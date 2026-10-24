import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PROTECTED_ROUTES = ["/dashboard", "/workspace", "/analytics", "/account"]
const AUTH_ROUTES = ["/login", "/signup"]
const DEFAULT_AUTHENTICATED_ROUTE = "/workspace"
const LOGIN_ROUTE = "/login"

function matchesRoute(pathname: string, routes: string[]) {
    return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet, responseHeaders) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                    if (responseHeaders) {
                        Object.entries(responseHeaders).forEach(([key, value]) => supabaseResponse.headers.set(key, value))
                    }
                },
            },
        }
    )
    const { data, error } = await supabase.auth.getClaims()
    const isAuthenticated = !!data?.claims && !error
    const { pathname, search } = request.nextUrl
    const isAuth = matchesRoute(pathname, AUTH_ROUTES)
    const isProtected = matchesRoute(pathname, PROTECTED_ROUTES)

    const redirect = (destination: string) => {
        const url = new URL(destination, request.url)
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
        for (const header of ["cache-control", "expires", "pragma"]) {
            const value = supabaseResponse.headers.get(header)
            if (value) response.headers.set(header, value)
        }
        return response
    }

    if (isAuthenticated && isAuth) {
        return redirect(DEFAULT_AUTHENTICATED_ROUTE)
    }

    if (!isAuthenticated && isProtected) {
        const url = new URL(LOGIN_ROUTE, request.url)
        url.searchParams.set("redirectTo", pathname + search)
        return redirect(url.toString())
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        "/login",
        "/signup",
        "/dashboard/:path*",
        "/workspace/:path*",
        "/analytics/:path*",
        "/account/:path*",
        "/settings/:path*",
    ],
}