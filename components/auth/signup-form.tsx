"use client"

import { useState, type ComponentProps, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/client"

export function SignupForm({ className, ...props }: ComponentProps<"div">) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setError("")
    setSuccess("")
    if (!name.trim()) {
      setError("Please enter your full name.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
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

  // const handleGoogleSignup = async () => {
  //   if (googleLoading) return
  //   setError("")
  //   setGoogleLoading(true)
  //   try {
  //     const { error: authError } = await supabase.auth.signInWithOAuth({
  //       provider: "google",
  //       options: { redirectTo: `${window.location.origin}/auth/callback` },
  //     })
  //     if (authError) throw authError
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Google authentication failed.")
  //     setGoogleLoading(false)
  //   }
  // }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Enter your details to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" type="text" placeholder="John Doe" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
              <Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                    <Input id="confirm-password" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </Field>
                </div>
                <FieldDescription>Must be at least 8 characters long.</FieldDescription>
              </Field>
              {error && <FieldDescription role="alert" className="text-destructive">{error}</FieldDescription>}
              {success && <FieldDescription role="status" className="text-green-600">{success}</FieldDescription>}
              <Field>
                <Button type="submit" disabled={loading || googleLoading}>{loading ? "Creating account..." : "Create Account"}</Button>
              </Field>
              {/* <FieldSeparator className="my-1 *:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>
              <Field>
                <Button variant="outline" type="button" disabled={loading || googleLoading} onClick={handleGoogleSignup}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                  </svg>
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </Button>
              </Field> */}
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