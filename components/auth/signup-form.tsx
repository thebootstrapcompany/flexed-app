"use client"

import { useState, type ComponentProps, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/client"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { ThemeToggle } from "../shared/theme-toggle"

export function SignupForm({ className, ...props }: ComponentProps<"div">) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleGuest = () => {
    const time = new Date().getMilliseconds();
    let mail = `guest${time}@example.com`;
    console.log(`[Guest Signup] - Email: guest${time}@example.com, Password: Guest@1234`);
    setName(`Guest ${time}`);
    setEmail(mail.toLowerCase().trim());
    setPassword("Guest@1234");
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setError("")
    setSuccess("")
    if (!name.trim()) {
      setError("Please enter your full name.")
      return
    }
    if (!email.trim()) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim()
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError
      if (data.session) {
        router.replace("/workspace")
        return
      }
      setSuccess("Please check your email to verify your account.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
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
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Enter your details to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" type="text" placeholder="Jane Smith" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} max={100} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="jane@flexed.in" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} max={256} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPass ? "Hide password" : "Show password"}>{showPass ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}</button>
                </div>
              </Field>
              {error && <FieldDescription role="alert" className="text-destructive">{error}</FieldDescription>}
              {success && <FieldDescription role="status" className="text-green-600">{success}</FieldDescription>}
              <Field>
                {process.env.NODE_ENV === "development" && (
                  <Button variant={"outline"} onClick={handleGuest}>
                    <p className="text-foreground">
                      Guest credentials (dev only)
                    </p>
                  </Button>
                )}
                <Button type="submit" disabled={loading}>{loading ? "Creating account..." : "Continue"}</Button>
              </Field>
              <Field>
                <FieldDescription className="text-center">Already have an account? <a href="/login">Log in</a></FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</FieldDescription>
    </div>
  )
}