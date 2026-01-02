// import posthog from "posthog-js";

// posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//   api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
//   // Include the defaults option as required by PostHog
//   defaults: "2025-05-24",
//   // Enables capturing unhandled exceptions via Error Tracking
//   capture_exceptions: true,
//   // Turn on debug in development mode
//   debug: process.env.NODE_ENV === "development",
// });

// // IMPORTANT: Never combine this approach with other client-side PostHog initialization approaches,
// // especially components like a PostHogProvider. instrumentation-client.ts is the correct solution
// // for initializing client-side PostHog in Next.js 15.3+ apps.

import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: {
      recordCrossOriginIframes: true,
    },
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}
