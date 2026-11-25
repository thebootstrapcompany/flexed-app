"use client"

import { useState, type ComponentProps, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/client"
import { ThemeToggle } from "../shared/theme-toggle"

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState("")

    const handleGuest = () => {
        let mail = `guest@example.com`;
        setEmail(mail.toLowerCase().trim());
        setPassword("Guest@1234");
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading || googleLoading) return
        setError("")
        setLoading(true)
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            })
            if (authError) throw authError
            if (!data.session) throw new Error("Unable to establish a session. Please try again.")
            const params = new URLSearchParams(window.location.search)
            const requestedPath = params.get("redirectTo")
            const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") && !requestedPath.startsWith("/\\") ? requestedPath : "/workspace"
            router.replace(destination)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <header className="fixed top-0 right-0 z-40 flex h-19 shrink-0 items-center px-4 md:px-6">
                <div className="flex items-center rounded-full border bg-card/90 shadow-sm backdrop-blur-md">
                    <ThemeToggle />
                </div>
            </header>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>Login with your email to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" type="email" placeholder="jane@flexed.in" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                </div>
                                <div className="relative">
                                    <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPass ? "Hide password" : "Show password"}>{showPass ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 2.16M2 2l20 20" /></svg>
                                    )}</button>
                                </div>
                            </Field>
                            {error && <FieldDescription role="alert" className="text-destructive">{error}</FieldDescription>}
                            <Field>
                                {process.env.NODE_ENV === "development" && (
                                    <Button variant={"outline"} onClick={handleGuest}>
                                        <p className="text-foreground">
                                            Guest credentials (dev only)
                                        </p>
                                    </Button>
                                )}
                                <Button type="submit" disabled={loading || googleLoading}>{loading ? "Logging in..." : "Continue"}</Button>
                            </Field>
                            <Field>
                                <FieldDescription className="text-center">Don&apos;t have an account? <a href="/signup">Sign up</a></FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</FieldDescription>
        </div>
    )
}