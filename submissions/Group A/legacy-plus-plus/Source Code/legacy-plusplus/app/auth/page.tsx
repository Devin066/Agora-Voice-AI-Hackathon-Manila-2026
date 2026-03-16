"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        setSignUpSuccess(true);
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Mic className="text-white" size={20} />
        </div>
        <span className="font-heading font-extrabold text-2xl text-text">
          Legacy<span className="text-primary">++</span>
        </span>
      </div>

      <Card elevated className="w-full max-w-sm">
        {signUpSuccess ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="font-heading font-bold text-xl text-text mb-2">
              Check your email
            </h2>
            <p className="text-muted font-body text-sm mb-6">
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account, then sign in.
            </p>
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={() => {
                setSignUpSuccess(false);
                setMode("signin");
              }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-heading font-bold text-2xl text-text mb-1">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted font-body text-sm mb-6">
              {mode === "signin"
                ? "Sign in to your parent account"
                : "Set up your parent account to get started"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-body font-semibold text-text mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full border border-border rounded-xl px-4 py-3 text-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                />
              </div>

              <div>
                <label className="block text-sm font-body font-semibold text-text mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full border border-border rounded-xl px-4 py-3 pr-11 text-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-error text-sm font-body bg-error/10 border border-error/30 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? "Please wait…"
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm font-body text-muted mt-5">
              {mode === "signin" ? (
                <>
                  No account?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(""); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("signin"); setError(""); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </Card>
    </main>
  );
}
