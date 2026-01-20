"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js"; // ✅ Direct import
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Capture logout event (before reset)
    posthog.capture("user_logged_out");

    // 2. Reset PostHog (unlink future events from this user)
    posthog.reset();

    // 3. Clear localStorage
    auth.logout();

    // 4. Redirect to login
    router.push("/");
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
