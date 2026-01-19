"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js"; // ✅ Direct import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { CheckSquare } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsLoading(true);

    try {
      // 1. Save user to localStorage
      const user = auth.login(email, name || undefined);

      // 2. Identify user in PostHog (direct call)
      posthog.identify(email, {
        email: email,
        name: name || undefined,
        identified_at: new Date().toISOString(),
      });

      // 3. Capture login event
      posthog.capture("user_logged_in", {
        email: email,
      });

      // 4. Redirect to tasks
      router.push("/tasks");
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
          </div>
          <CardDescription>
            Enter your email to access your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? "Logging in..." : "Continue"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              This is a demo app for testing PostHog. No password required!
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
