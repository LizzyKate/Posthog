# PostHog Integration Guide for TaskFlow

This document outlines how PostHog analytics will be integrated into TaskFlow across the 30-day series.

---

## Week 1: Foundation (Days 1-7)

### Day 1: What is PostHog? Why Self-Hosted Analytics?

**Integration:** None (theoretical overview)

- Explain analytics needs for task management apps
- Why PostHog vs Google Analytics for developer tools
- Self-hosted privacy benefits

---

### Day 2: PostHog Cloud vs Self-Hosted Comparison

**Integration:** None (comparison post)

- Cost analysis for TaskFlow scale
- Feature comparison
- Decision matrix for our use case

---

### Day 3: Setting Up PostHog Cloud

**Integration Point:** Initial Setup

**Files to create:**

- `lib/posthog.ts` - PostHog client configuration
- `.env.local` - Environment variables

**Code to add:**

```typescript
// lib/posthog.ts
import posthog from "posthog-js";

export const initPostHog = () => {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          posthog.debug();
        }
      },
    });
  }
  return posthog;
};
```

**Environment variables:**

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**What to track:**

- ✅ Account creation
- ✅ Project setup
- ✅ API key generation

---

### Day 4: Installing PostHog Locally with Docker

**Integration Point:** Local Development Setup

**Files to create:**

- `docker-compose.yml` - Local PostHog instance
- Documentation on switching between cloud and local

**Docker setup:**

```yaml
version: "3"
services:
  posthog:
    image: posthog/posthog:latest
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=your_secret_key
      - DATABASE_URL=postgres://posthog:posthog@db:5432/posthog
```

**What to demonstrate:**

- Running PostHog locally
- Switching API host in environment
- Benefits for development/testing

---

### Day 5: First Event Tracking - JavaScript Setup

**Integration Point:** Basic Event Tracking

**Files to modify:**

- `app/providers.tsx` - Add PostHog provider
- `app/layout.tsx` - Wrap with provider

**Code to add:**

```typescript
// app/providers.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog } from "@/lib/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const posthog = initPostHog();

    if (pathname) {
      posthog.capture("$pageview", {
        $current_url: pathname + (searchParams?.toString() || ""),
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// app/layout.tsx - wrap children with PostHogProvider
```

**Events to track:**

- ✅ Page views (automatic)
- ✅ App loaded
- ✅ Initial render complete

---

### Day 6: PostHog Toolbar - Visual Event Tracking

**Integration Point:** Visual Event Inspector

**Code to add:**

```typescript
// lib/posthog.ts - add to init
posthog.init(key, {
  // ... existing config
  opt_in_site_apps: true, // Enable toolbar
});
```

**What to demonstrate:**

- Activating toolbar in app
- Inspecting elements visually
- Creating events without code
- Heatmap visualization

**Use cases in TaskFlow:**

- Click tracking on "Add Task" button
- Form field interactions
- Filter tab switches
- Task completion clicks

---

### Day 7: Understanding the Dashboard Interface

**Integration Point:** Dashboard Navigation

**What to demonstrate:**

- Viewing captured pageviews
- Understanding event timeline
- User identification
- Session recordings list
- Basic metrics overview

**Screenshots needed:**

- TaskFlow events in dashboard
- User sessions
- Event breakdown
- Geographic data (if any)

---

## Week 2: Core Analytics (Days 8-14)

### Day 8: Custom Event Tracking - Beyond Page Views

**Integration Point:** Task Lifecycle Events

**Files to modify:**

- `lib/store.ts` - Add PostHog to all actions
- `hooks/use-tasks.ts` - Track task operations

**Events to implement:**

**1. Task Created:**

```typescript
// In addTask action
posthog.capture("task_created", {
  category: task.category,
  priority: task.priority,
  has_description: !!task.description,
  has_due_date: !!task.dueDate,
  title_length: task.title.length,
});
```

**2. Task Completed:**

```typescript
// In toggleTask action (when completing)
posthog.capture("task_completed", {
  task_id: task.id,
  category: task.category,
  priority: task.priority,
  time_to_complete_hours: calculateHours(task.createdAt, now),
  completed_on_time: !isOverdue(task.dueDate),
});
```

**3. Task Deleted:**

```typescript
// In deleteTask action
posthog.capture("task_deleted", {
  task_id: task.id,
  was_completed: task.completed,
  category: task.category,
  priority: task.priority,
  existed_for_hours: calculateHours(task.createdAt, now),
});
```

**4. Task Uncompleted:**

```typescript
// In toggleTask action (when uncompleting)
posthog.capture("task_uncompleted", {
  task_id: task.id,
  category: task.category,
});
```

**5. Search Used:**

```typescript
// In setSearchQuery action
posthog.capture("task_searched", {
  query_length: query.length,
  results_count: filteredTasks.length,
});
```

**6. Filter Changed:**

```typescript
// In setFilter action
posthog.capture("filter_changed", {
  from: currentFilter,
  to: newFilter,
  task_count: filteredTasks.length,
});
```

**7. Clear Completed:**

```typescript
// In clearCompleted action
posthog.capture("completed_tasks_cleared", {
  cleared_count: completedTasks.length,
  remaining_count: activeTasks.length,
});
```

---

### Day 9: User Identification & Group Properties

**Integration Point:** User & Session Properties

**Files to create:**

- `lib/user-tracking.ts` - User identification logic

**Code to implement:**

```typescript
// lib/user-tracking.ts
import posthog from "posthog-js";

export function identifyUser() {
  // Generate or retrieve user ID
  let userId = localStorage.getItem("taskflow_user_id");

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("taskflow_user_id", userId);
  }

  // Identify user in PostHog
  posthog.identify(userId, {
    // User properties
    first_seen: new Date().toISOString(),
    app_version: "1.0.0",
  });
}

export function updateUserProperties(tasks: Task[]) {
  const stats = calculateStats(tasks);

  posthog.setPersonProperties({
    total_tasks: stats.total,
    completed_tasks: stats.completed,
    active_tasks: stats.active,
    completion_rate: stats.completionRate,
    most_used_category: getMostUsedCategory(tasks),
    most_used_priority: getMostUsedPriority(tasks),
    is_power_user: stats.total > 20,
    last_active: new Date().toISOString(),
  });
}
```

**User properties to track:**

- Total tasks created
- Completion rate
- Most used category
- Most used priority
- Power user flag (>20 tasks)
- Last active timestamp
- Streak (consecutive days)

**Group properties (for team features):**

```typescript
// Future: when adding team features
posthog.group("company", "company_id_123", {
  name: "Acme Corp",
  plan: "pro",
  created_at: "2024-01-01",
});
```

---

### Day 10: Session Replays - Part 1: Basics

**Integration Point:** Enable Session Recording

**Code to add:**

```typescript
// lib/posthog.ts - update init
posthog.init(key, {
  // ... existing config
  session_recording: {
    maskAllInputs: true,
    maskAllText: false,
  },
});
```

**What to demonstrate:**

- Enabling session recording
- Watching user create a task
- Observing filter interactions
- Viewing task completion flow
- Identifying UX issues

**Use cases:**

- Watch users struggle with task form
- See how users interact with filters
- Identify confusion points
- Observe mobile vs desktop behavior

---

### Day 11: Session Replays - Part 2: Privacy & Filtering

**Integration Point:** Privacy Configuration

**Code to implement:**

```typescript
// lib/posthog.ts - enhanced recording config
session_recording: {
  maskAllInputs: true, // Mask sensitive inputs
  maskAllText: false, // Show UI text
  maskTextSelector: '.task-description', // Mask task descriptions
  recordCrossOriginIframes: false,

  // Conditional recording
  recordHeaders: false,
  recordBody: false,
}
```

**Privacy considerations for TaskFlow:**

- ✅ Mask task descriptions (may contain sensitive info)
- ✅ Mask task titles (optional - discuss tradeoffs)
- ✅ Don't mask UI text (buttons, labels)
- ✅ Don't record cross-origin content

**Filtering replays:**

- By user property (power users)
- By event (users who delete many tasks)
- By session duration (long sessions = engaged users)
- By rage clicks (frustration indicators)

---

### Day 12: Funnel Analysis - Tracking User Journeys

**Integration Point:** User Flow Funnels

**Funnels to create:**

**1. Task Completion Funnel:**

```
Step 1: Task Created (task_created)
Step 2: Task Viewed (page_viewed + task in view)
Step 3: Task Completed (task_completed)

Conversion: % of created tasks that get completed
```

**2. New User Onboarding Funnel:**

```
Step 1: App Loaded (app_loaded)
Step 2: First Task Created (task_created, first time)
Step 3: First Task Completed (task_completed, first time)
Step 4: Second Session (app_loaded, day 2)

Conversion: % of new users who complete onboarding
```

**3. Power User Activation Funnel:**

```
Step 1: 5+ Tasks Created (task_created count >= 5)
Step 2: Used Filters (filter_changed)
Step 3: Used Search (task_searched)
Step 4: Cleared Completed (completed_tasks_cleared)

Conversion: % of users who become power users
```

**4. Task Form Abandonment:**

```
Step 1: Add Task Clicked (add_task_button_clicked)
Step 2: Form Opened (task_form_opened)
Step 3: Title Entered (task_title_entered)
Step 4: Task Created (task_created)

Conversion: % of form opens that result in task creation
Drop-off analysis: Where users abandon the form
```

**Code to track funnel events:**

```typescript
// Track form opening
posthog.capture("task_form_opened");

// Track form field interactions
posthog.capture("task_title_entered", {
  title_length: title.length,
});

// Track form submission
posthog.capture("task_created", {
  // ... task properties
  form_completion_time_seconds: timeSinceOpen,
});
```

---

### Day 13: Web Analytics Dashboard - GA Alternative

**Integration Point:** Pre-built Analytics Dashboard

**What to demonstrate:**

- Built-in web analytics view
- Pageview tracking (already configured)
- Session metrics
- User metrics
- Bounce rate
- Session duration

**TaskFlow-specific metrics:**

```typescript
// Track page-specific properties
posthog.capture("$pageview", {
  page_type: "task_list",
  task_count: tasks.length,
  active_filter: filter,
  has_search: !!searchQuery,
});
```

**Custom dashboard to create:**

- Total users (unique)
- Total tasks created
- Tasks completed today
- Average completion rate
- Most used categories
- Peak usage times

---

### Day 14: Retention Tracking - Who Comes Back?

**Integration Point:** Cohort Retention Analysis

**Retention metrics to track:**

**1. Daily Active Users (DAU):**

```typescript
// Track app opens
posthog.capture("app_opened", {
  hour_of_day: new Date().getHours(),
  day_of_week: new Date().getDay(),
});
```

**2. Task Completion Retention:**

```
Cohort: Users who created a task
Returning action: Completed at least one task
Time window: 1 day, 7 days, 30 days
```

**3. Feature Adoption Retention:**

```
Cohort: New users (first app_opened)
Returning actions:
- Created 2nd task (D1 retention)
- Used filters (D7 retention)
- Became power user (D30 retention)
```

**4. Weekly Active Users (WAU):**

```typescript
// Update user properties weekly
posthog.setPersonProperties({
  weekly_active_user: true,
  tasks_this_week: weeklyTaskCount,
  completion_rate_this_week: weeklyCompletionRate,
});
```

**Retention queries to build:**

- % of users who return next day
- % of users who complete 3+ tasks in first week
- % of users who use filters in first 3 days
- % of users who remain active after 30 days

---

## Week 3: Product Features (Days 15-21)

### Day 15: Feature Flags - Rollouts Made Easy

**Integration Point:** Dark Mode Toggle

**Files to create:**

- `hooks/use-feature-flag.ts` - Feature flag hook

**Code to implement:**

```typescript
// hooks/use-feature-flag.ts
import { useEffect, useState } from "react";
import posthog from "posthog-js";

export function useFeatureFlag(flagKey: string) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFlag = () => {
      const enabled = posthog.isFeatureEnabled(flagKey);
      setIsEnabled(!!enabled);
      setIsLoading(false);
    };

    checkFlag();

    // Listen for flag changes
    posthog.onFeatureFlags(checkFlag);
  }, [flagKey]);

  return { isEnabled, isLoading };
}
```

**Feature flag to implement: Dark Mode**

```typescript
// app/page.tsx
export default function Home() {
  const { isEnabled: darkModeEnabled } = useFeatureFlag("dark-mode");

  return (
    <div className={darkModeEnabled ? "dark" : ""}>{/* App content */}</div>
  );
}
```

**PostHog dashboard setup:**

1. Create feature flag: `dark-mode`
2. Set rollout: 50% of users
3. Track usage:

```typescript
useEffect(() => {
  if (darkModeEnabled) {
    posthog.capture("dark_mode_enabled", {
      automatically_enabled: true,
      user_preference: false,
    });
  }
}, [darkModeEnabled]);
```

---

### Day 16: Feature Flags - Advanced Targeting Patterns

**Integration Point:** User Segment Targeting

**Advanced feature flags to implement:**

**1. Power User Features:**

```typescript
// Feature flag: 'advanced-stats'
// Targeting: users with total_tasks > 20

const { isEnabled: advancedStatsEnabled } = useFeatureFlag("advanced-stats");

{
  advancedStatsEnabled && (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Productivity trends, time-of-day patterns, etc. */}
      </CardContent>
    </Card>
  );
}
```

**PostHog setup:**

```
Flag: advanced-stats
Condition: total_tasks > 20
OR
Condition: is_power_user = true
```

**2. Beta Features for Early Adopters:**

```typescript
// Feature flag: 'ai-suggestions'
// Targeting: users with email domain = @anthropic.com
// OR users who opted into beta

const { isEnabled: aiSuggestionsEnabled } = useFeatureFlag("ai-suggestions");

{
  aiSuggestionsEnabled && (
    <Button variant="outline">✨ AI Task Suggestions</Button>
  );
}
```

**3. Gradual Rollout:**

```typescript
// Feature flag: 'new-task-form'
// Rollout: 10% day 1, 25% day 2, 50% day 3, 100% day 5

const { isEnabled: newFormEnabled } = useFeatureFlag("new-task-form");

return newFormEnabled ? <NewTaskForm /> : <LegacyTaskForm />;
```

**Track flag exposure:**

```typescript
posthog.capture("feature_flag_called", {
  flag_key: "advanced-stats",
  flag_value: advancedStatsEnabled,
  user_segment: "power_user",
});
```

---

### Day 17: A/B Testing with PostHog

**Integration Point:** Button Variant Testing

**Experiment to run:**

**Test: Task Completion Button Color**

- Control: Default button (gray)
- Variant A: Green button
- Variant B: Blue button
- Goal: Increase task completion rate

**Code implementation:**

```typescript
// hooks/use-experiment.ts
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

export function useExperiment(experimentKey: string) {
  const [variant, setVariant] = useState<string>('control')

  useEffect(() => {
    const featureFlag = posthog.getFeatureFlag(experimentKey)
    setVariant(featureFlag as string || 'control')

    // Track exposure
    posthog.capture('experiment_exposure', {
      experiment_key: experimentKey,
      variant: featureFlag,
    })
  }, [experimentKey])

  return variant
}

// components/task-item.tsx
const variant = useExperiment('task-button-color')

const buttonClass =
  variant === 'variant-a' ? 'bg-green-600 hover:bg-green-700' :
  variant === 'variant-b' ? 'bg-blue-600 hover:bg-blue-700' :
  'bg-gray-600 hover:bg-gray-700'

<Checkbox
  checked={task.completed}
  onCheckedChange={() => {
    toggleTask(task.id)

    // Track conversion event
    if (!task.completed) {
      posthog.capture('task_completed_in_experiment', {
        experiment_key: 'task-button-color',
        variant,
        task_priority: task.priority,
      })
    }
  }}
  className={buttonClass}
/>
```

**PostHog experiment setup:**

1. Create experiment: `task-button-color`
2. Variants: control, variant-a, variant-b (33% each)
3. Goal metric: `task_completed_in_experiment` event count
4. Secondary metrics:
   - Time to completion
   - Completion rate by priority
   - User satisfaction (survey)

**Statistical significance:**

- Minimum sample size: 100 users per variant
- Confidence level: 95%
- Run duration: 7-14 days

---

### Day 18: Surveys & In-App Feedback

**Integration Point:** User Satisfaction Survey

**Surveys to implement:**

**1. Task Completion Survey:**

```typescript
// Trigger survey after completing 5 tasks
useEffect(() => {
  if (stats.completed === 5) {
    posthog.capture("survey_eligible", {
      survey_type: "task_completion_satisfaction",
      trigger_event: "completed_5_tasks",
    });
  }
}, [stats.completed]);
```

**PostHog survey config:**

```
Survey Name: "Task Completion Satisfaction"
Trigger: After user completes 5 tasks
Question: "How satisfied are you with TaskFlow's task management?"
Type: Rating scale (1-5 stars)
Follow-up: "What would make TaskFlow better for you?" (open text)
```

**2. Feature Request Survey:**

```typescript
// Show survey to users who've been active for 7 days
useEffect(() => {
  const daysSinceFirstUse = calculateDays(firstUseDate, now);

  if (daysSinceFirstUse === 7) {
    posthog.capture("survey_eligible", {
      survey_type: "feature_request",
      days_active: daysSinceFirstUse,
    });
  }
}, []);
```

**PostHog survey config:**

```
Survey Name: "Feature Requests"
Trigger: 7 days after first use
Question: "What feature would you like to see in TaskFlow?"
Type: Multiple choice
Options:
- Team collaboration
- Calendar integration
- Recurring tasks
- Mobile app
- Other (text input)
```

**3. NPS Survey:**

```typescript
// Show NPS survey to power users
useEffect(() => {
  if (stats.total > 20 && !hasCompletedNPS) {
    posthog.capture("survey_eligible", {
      survey_type: "nps",
      user_segment: "power_user",
    });
  }
}, [stats.total]);
```

**PostHog survey config:**

```
Survey Name: "Net Promoter Score"
Trigger: For users with 20+ tasks
Question: "How likely are you to recommend TaskFlow to a friend?"
Type: NPS (0-10 scale)
Follow-up: "What's the primary reason for your score?"
```

**Track survey responses:**

```typescript
posthog.capture("survey_completed", {
  survey_id: "nps-2024",
  score: npsScore,
  response_text: responseText,
  user_segment: "power_user",
});
```

---

### Day 19: Cohort Analysis - Segmenting Users

**Integration Point:** User Segmentation

**Cohorts to create:**

**1. Power Users:**

```
Definition:
- total_tasks > 20 OR
- completion_rate > 80% OR
- active_days > 7

Use case:
- Target for advanced features
- Beta testing
- Testimonials
```

**2. At-Risk Users:**

```
Definition:
- last_active > 7 days ago AND
- completed_tasks = 0 AND
- total_tasks < 5

Use case:
- Re-engagement campaigns
- Onboarding improvements
- Survey about abandonment reasons
```

**3. Category-Based Cohorts:**

```
Work-Focused Users:
- most_used_category = 'work'

Health-Focused Users:
- most_used_category = 'health'

Personal Users:
- most_used_category = 'personal'

Use case:
- Personalized content
- Feature recommendations
- Targeted surveys
```

**4. Behavioral Cohorts:**

```
High-Priority Users:
- most_used_priority = 'high'
- Average tasks: urgent/important

Organized Users:
- Uses filters frequently
- Uses search regularly
- Clears completed tasks

Casual Users:
- Tasks: sporadic
- Low completion rate
- Doesn't use advanced features
```

**Code to update user properties for cohorts:**

```typescript
// Update after every task action
posthog.setPersonProperties({
  total_tasks: tasks.length,
  completion_rate: (completed / total) * 100,
  most_used_category: getMostUsedCategory(tasks),
  most_used_priority: getMostUsedPriority(tasks),
  uses_filters: filterUsageCount > 10,
  uses_search: searchUsageCount > 5,
  is_power_user: isPowerUser(tasks),
  is_at_risk: isAtRisk(lastActive, tasks),
  user_segment: determineSegment(tasks, behavior),
});
```

---

### Day 20: Annotations & Custom Dashboards

**Integration Point:** Product Analytics Dashboard

**Annotations to add:**

- Feature releases
- A/B test start/end dates
- Bug fixes
- Marketing campaigns
- UI redesigns

**Code to track releases:**

```typescript
// Track feature releases
posthog.capture("feature_released", {
  feature_name: "dark-mode",
  release_date: "2024-01-20",
  rollout_percentage: 100,
});
```

**Custom dashboard: TaskFlow KPIs**

**Widgets to create:**

1. **Total Tasks Created** (Line chart over time)
2. **Task Completion Rate** (% completed vs created)
3. **Active Users** (DAU/WAU/MAU)
4. **Retention** (D1, D7, D30 retention curves)
5. **Feature Adoption** (% users using filters, search, etc.)
6. **Task Distribution** (Pie chart by category)
7. **Priority Distribution** (Bar chart)
8. **Average Time to Complete** (By priority level)
9. **Funnel: Task Creation → Completion** (Conversion %)
10. **Power User Growth** (Users with 20+ tasks over time)

**Insights to create:**

- Correlation: Does using filters → higher completion rate?
- Trend: Are tasks created on Mondays completed faster?
- Segment: Do power users prefer certain categories?
- Experiment results: Which button color wins?

---

### Day 21: Privacy Settings & GDPR Compliance

**Integration Point:** Privacy Controls

**Privacy features to implement:**

**1. Opt-out mechanism:**

```typescript
// components/privacy-banner.tsx
export function PrivacyBanner() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem("analytics-consent");
    setHasConsented(consent === "true");
  }, []);

  const handleAccept = () => {
    localStorage.setItem("analytics-consent", "true");
    posthog.opt_in_capturing();
    setHasConsented(true);
  };

  const handleDecline = () => {
    localStorage.setItem("analytics-consent", "false");
    posthog.opt_out_capturing();
    setHasConsented(false);
  };

  if (hasConsented !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use analytics to improve your experience. Your data is anonymized
          and never sold.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleDecline} variant="outline">
            Decline
          </Button>
          <Button onClick={handleAccept}>Accept</Button>
        </div>
      </div>
    </div>
  );
}
```

**2. Data deletion:**

```typescript
// User settings page
export function DataDeletionButton() {
  const handleDelete = async () => {
    // Delete user's PostHog data
    await fetch("/api/delete-analytics-data", {
      method: "POST",
    });

    // Reset local storage
    localStorage.clear();

    // Opt out
    posthog.opt_out_capturing();
    posthog.reset();

    alert("Your analytics data has been deleted.");
  };

  return (
    <Button onClick={handleDelete} variant="destructive">
      Delete My Analytics Data
    </Button>
  );
}
```

**3. Session recording privacy:**

```typescript
// lib/posthog.ts - privacy-focused config
posthog.init(key, {
  session_recording: {
    maskAllInputs: true, // Mask all input fields
    maskTextSelector: ".sensitive-data", // Mask specific elements
    maskAllText: false, // Show UI text (non-sensitive)
    recordCrossOriginIframes: false,
    recordHeaders: false,
    recordBody: false,
  },
  persistence: "localStorage", // or 'cookie' with proper consent
  opt_out_capturing_by_default: true, // Opt-in by default
});
```

**GDPR compliance checklist:**

- ✅ Cookie consent banner
- ✅ Privacy policy link
- ✅ Data deletion on request
- ✅ Opt-out mechanism
- ✅ Session recording masks sensitive data
- ✅ Data retention policy (30 days)
- ✅ No tracking before consent
- ✅ Clear data usage explanation

---

## Week 4: Advanced & Production (Days 22-30)

### Day 22: Integrating PostHog with React

**Integration Point:** React Patterns & Hooks

**Advanced React patterns:**

**1. Context Provider Pattern:**

```typescript
// lib/posthog-context.tsx
import { createContext, useContext, useEffect, useState } from "react";
import posthog from "posthog-js";

interface PostHogContextType {
  posthog: typeof posthog;
  isReady: boolean;
}

const PostHogContext = createContext<PostHogContextType | null>(null);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== "undefined") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        // config
      });
      setIsReady(true);
    }
  }, []);

  return (
    <PostHogContext.Provider value={{ posthog, isReady }}>
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error("usePostHog must be used within PostHogProvider");
  }
  return context;
}
```

**2. Custom Hooks:**

```typescript
// hooks/use-track-event.ts
export function useTrackEvent() {
  const { posthog, isReady } = usePostHog();

  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      if (!isReady) return;

      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        app_version: "1.0.0",
      });
    },
    [posthog, isReady]
  );

  return trackEvent;
}

// Usage in components
const trackEvent = useTrackEvent();

const handleClick = () => {
  trackEvent("button_clicked", {
    button_name: "add_task",
    location: "header",
  });
};
```

**3. HOC Pattern:**

```typescript
// hoc/with-analytics.tsx
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  eventName: string
) {
  return function AnalyticsComponent(props: P) {
    const trackEvent = useTrackEvent();

    useEffect(() => {
      trackEvent(`${eventName}_mounted`);

      return () => {
        trackEvent(`${eventName}_unmounted`);
      };
    }, []);

    return <Component {...props} />;
  };
}

// Usage
const TaskListWithAnalytics = withAnalytics(TaskList, "task_list");
```

**4. Performance Tracking:**

```typescript
// hooks/use-track-performance.ts
export function useTrackPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      posthog.capture("component_render_time", {
        component_name: componentName,
        duration_ms: duration,
      });
    };
  }, [componentName]);
}

// Usage
export function TaskList() {
  useTrackPerformance("TaskList");
  // ... component code
}
```

---

### Day 23: PostHog + Next.js Server-Side Events

**Integration Point:** Server-Side Tracking

**Setup server-side PostHog:**

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const posthogServer = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST || "https://app.posthog.com",
});

// Flush events on shutdown
if (typeof process !== "undefined") {
  process.on("SIGTERM", async () => {
    await posthogServer.shutdown();
  });
}
```

**API route tracking:**

```typescript
// app/api/tasks/route.ts
import { posthogServer } from "@/lib/posthog-server";

export async function POST(request: Request) {
  const body = await request.json();

  // Track server-side event
  posthogServer.capture({
    distinctId: body.userId || "anonymous",
    event: "task_created_server",
    properties: {
      ...body,
      server_timestamp: new Date().toISOString(),
      user_agent: request.headers.get("user-agent"),
    },
  });

  // ... handle task creation

  return Response.json({ success: true });
}
```

**Server-side user identification:**

```typescript
// app/api/auth/callback/route.ts
export async function GET(request: Request) {
  const userId = getUserIdFromSession(request);

  if (userId) {
    posthogServer.identify({
      distinctId: userId,
      properties: {
        email: user.email,
        name: user.name,
        signup_date: user.createdAt,
      },
    });
  }

  return Response.json({ success: true });
}
```

**When to use server-side vs client-side:**

**Client-side (browser):**

- ✅ User interactions (clicks, form submissions)
- ✅ Page views
- ✅ Session recordings
- ✅ Feature flags
- ✅ A/B tests

**Server-side (API routes):**

- ✅ API calls
- ✅ Data mutations
- ✅ Background jobs
- ✅ Webhooks
- ✅ Sensitive operations (authentication, payments)

---

### Day 24: Self-Hosting PostHog on AWS

**Integration:** None in app (deployment tutorial)

**What to demonstrate:**

- AWS setup (EC2, RDS, S3)
- PostHog deployment with Docker Compose
- Configuration for production
- SSL certificate setup
- Environment variable management
- Switching app from cloud to self-hosted

**Update environment variables:**

```bash
# .env.production
NEXT_PUBLIC_POSTHOG_KEY=your_self_hosted_key
NEXT_PUBLIC_POSTHOG_HOST=https://posthog.yourdomain.com
```

No code changes needed in app!

---

### Day 25: Performance Optimization Tips

**Integration Point:** Lazy Loading & Optimization

**Optimizations to implement:**

**1. Lazy load PostHog:**

```typescript
// lib/posthog-lazy.ts
let posthogInstance: any = null;

export async function getPostHog() {
  if (!posthogInstance) {
    const posthog = await import("posthog-js");
    posthogInstance = posthog.default;

    posthogInstance.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      // config
    });
  }

  return posthogInstance;
}

// Usage
const posthog = await getPostHog();
posthog.capture("event");
```

**2. Debounce event tracking:**

```typescript
// utils/debounce-track.ts
import { debounce } from "lodash";

export const debouncedTrack = debounce((eventName: string, properties: any) => {
  posthog.capture(eventName, properties);
}, 300);

// Usage for rapid events
debouncedTrack("task_title_changed", { length: title.length });
```

**3. Batch events:**

```typescript
// Queue events and send in batches
const eventQueue: Array<{ event: string; properties: any }> = [];

function queueEvent(event: string, properties: any) {
  eventQueue.push({ event, properties });

  if (eventQueue.length >= 10) {
    flushEvents();
  }
}

function flushEvents() {
  eventQueue.forEach(({ event, properties }) => {
    posthog.capture(event, properties);
  });
  eventQueue.length = 0;
}

// Flush on page unload
window.addEventListener("beforeunload", flushEvents);
```

**4. Conditional loading:**

```typescript
// Only load PostHog in production
if (process.env.NODE_ENV === "production") {
  posthog.init(/* ... */);
}
```

**Performance metrics to track:**

- PostHog SDK load time
- Event capture latency
- Session recording impact
- Feature flag fetch time

---

### Day 26: Data Warehouse & SQL Queries

**Integration Point:** Advanced Analytics

**SQL queries to run on PostHog data:**

**1. Task completion by hour of day:**

```sql
SELECT
  extract(hour from timestamp) as hour,
  count(*) as completed_tasks
FROM events
WHERE event = 'task_completed'
  AND timestamp > now() - interval '30 days'
GROUP BY hour
ORDER BY hour
```

**2. User retention cohorts:**

```sql
WITH first_seen AS (
  SELECT
    distinct_id,
    min(date(timestamp)) as cohort_date
  FROM events
  WHERE event = 'app_opened'
  GROUP BY distinct_id
)
SELECT
  cohort_date,
  count(distinct distinct_id) as cohort_size,
  count(distinct CASE
    WHEN date(timestamp) = cohort_date + 1
    THEN distinct_id
  END) as day_1_retained,
  count(distinct CASE
    WHEN date(timestamp) = cohort_date + 7
    THEN distinct_id
  END) as day_7_retained
FROM events e
JOIN first_seen fs ON e.distinct_id = fs.distinct_id
WHERE e.event = 'app_opened'
GROUP BY cohort_date
ORDER BY cohort_date DESC
```

**3. Feature flag adoption:**

```sql
SELECT
  properties->>'flag_key' as feature_flag,
  properties->>'flag_value' as enabled,
  count(distinct distinct_id) as unique_users
FROM events
WHERE event = 'feature_flag_called'
  AND timestamp > now() - interval '7 days'
GROUP BY feature_flag, enabled
```

**4. Funnel conversion with time:**

```sql
-- Average time from task creation to completion
WITH task_lifecycles AS (
  SELECT
    properties->>'task_id' as task_id,
    min(CASE WHEN event = 'task_created' THEN timestamp END) as created_at,
    max(CASE WHEN event = 'task_completed' THEN timestamp END) as completed_at
  FROM events
  WHERE event IN ('task_created', 'task_completed')
  GROUP BY task_id
)
SELECT
  avg(extract(epoch from (completed_at - created_at))/3600) as avg_hours_to_complete,
  count(*) as completed_tasks
FROM task_lifecycles
WHERE completed_at IS NOT NULL
```

**Export data for external analysis:**

```typescript
// API route to export data
import { posthogServer } from "@/lib/posthog-server";

export async function GET() {
  // Query PostHog data warehouse
  const results = await posthogServer.query(`
    SELECT * FROM events
    WHERE event = 'task_completed'
    AND timestamp > now() - interval '7 days'
  `);

  return Response.json(results);
}
```

---

### Day 27: PostHog API - Programmatic Access

**Integration Point:** API Integration

**Use cases for PostHog API:**

**1. Export analytics data:**

```typescript
// utils/export-analytics.ts
export async function exportAnalytics(startDate: string, endDate: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${PROJECT_ID}/events/?after=${startDate}&before=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data.results;
}
```

**2. Create custom insights programmatically:**

```typescript
// utils/create-insight.ts
export async function createInsight(insightConfig: any) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${PROJECT_ID}/insights/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(insightConfig),
    }
  );

  return response.json();
}
```

**3. Retrieve feature flags via API:**

```typescript
// Server-side feature flag check
export async function checkFeatureFlag(userId: string, flagKey: string) {
  const response = await fetch(`https://app.posthog.com/decide/?v=2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      distinct_id: userId,
    }),
  });

  const data = await response.json();
  return data.featureFlags[flagKey];
}
```

**4. Trigger actions via API:**

```typescript
// Trigger PostHog action from server
export async function triggerAction(userId: string, actionName: string) {
  posthogServer.capture({
    distinctId: userId,
    event: actionName,
    properties: {
      triggered_via: "api",
      timestamp: new Date().toISOString(),
    },
  });
}
```

---

### Day 28: Debugging Common Issues

**Integration Point:** Troubleshooting Guide

**Common issues and solutions:**

**1. Events not appearing in dashboard:**

```typescript
// Debug mode
posthog.init(key, {
  debug: true, // Logs all events to console
  loaded: (posthog) => {
    console.log("PostHog loaded successfully");
  },
});

// Verify events are being sent
posthog.capture("test_event", { test: true });
console.log("Event sent:", posthog._capture_metrics);
```

**2. Session recordings not working:**

```typescript
// Check recording status
console.log("Recording enabled:", posthog.sessionRecordingStarted());

// Force start recording
posthog.startSessionRecording();

// Verify config
console.log("Session recording config:", posthog.config.session_recording);
```

**3. Feature flags not loading:**

```typescript
// Wait for feature flags to load
posthog.onFeatureFlags(() => {
  console.log("Feature flags loaded:", posthog.getFeatureFlags());

  const darkMode = posthog.isFeatureEnabled("dark-mode");
  console.log("Dark mode enabled:", darkMode);
});

// Force reload flags
posthog.reloadFeatureFlags();
```

**4. User identification issues:**

```typescript
// Verify user is identified
console.log("Current distinct_id:", posthog.get_distinct_id());
console.log("User properties:", posthog.get_property("email"));

// Reset and re-identify
posthog.reset();
posthog.identify("user_123", { email: "user@example.com" });
```

**5. CORS errors:**

```typescript
// Ensure correct host is set
posthog.init(key, {
  api_host: "https://app.posthog.com", // or your self-hosted URL
  ui_host: "https://app.posthog.com",
});
```

**Debug panel in app:**

```typescript
// components/debug-panel.tsx
export function DebugPanel() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Intercept PostHog events
    const originalCapture = posthog.capture;
    posthog.capture = function (...args) {
      setLogs((prev) => [...prev, `Event: ${args[0]}`]);
      return originalCapture.apply(this, args);
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 bg-black text-white p-4 max-w-md">
      <h3>PostHog Debug</h3>
      <div className="space-y-1 text-xs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
```

---

### Day 29: PostHog vs Google Analytics - Final Comparison

**Integration:** None (comparison blog post)

**Comparison topics:**

- Feature parity
- Pricing (actual costs for TaskFlow scale)
- Privacy implications
- Self-hosting option
- Session recordings
- Feature flags
- Developer experience
- Data ownership
- GDPR compliance
- Implementation complexity

**TaskFlow-specific findings:**

- Which features we actually used
- Unexpected benefits
- Limitations discovered
- Cost analysis
- Time saved vs GA implementation

---

### Day 30: 30 Days Later - Complete Setup & Recommendation

**Integration:** Final Implementation Review

**Complete implementation checklist:**

**✅ Events Tracked (20+ events):**

- app_opened
- task_created
- task_completed
- task_deleted
- task_uncompleted
- task_searched
- filter_changed
- completed_tasks_cleared
- add_task_button_clicked
- task_form_opened
- task_title_entered
- feature_flag_called
- experiment_exposure
- task_completed_in_experiment
- survey_eligible
- survey_completed
- dark_mode_enabled
- component_render_time
- ...more

**✅ User Properties (15+ properties):**

- total_tasks
- completed_tasks
- active_tasks
- completion_rate
- most_used_category
- most_used_priority
- is_power_user
- is_at_risk
- uses_filters
- uses_search
- first_seen
- last_active
- ...more

**✅ Features Implemented:**

- ✅ Client-side tracking
- ✅ Server-side tracking
- ✅ Session recordings
- ✅ Feature flags (2+)
- ✅ A/B testing (1 experiment)
- ✅ Surveys (3 types)
- ✅ User identification
- ✅ Cohorts (5+)
- ✅ Custom dashboards
- ✅ Funnels (4+)
- ✅ Retention tracking
- ✅ Privacy controls
- ✅ Performance optimization

**Final recommendation:**

- Would I use PostHog for production?
- Pros and cons discovered
- Alternative tools considered
- Cost-benefit analysis
- Next steps for TaskFlow

---

## Implementation Priority

**Must-Have (Weeks 1-2):**

- Basic event tracking
- User identification
- Session recordings
- Web analytics

**Should-Have (Week 3):**

- Feature flags
- A/B testing
- Surveys
- Cohorts

**Nice-to-Have (Week 4):**

- Advanced patterns
- Performance optimization
- Data warehouse queries
- API integration

---

## Testing Checklist

**Before each blog post, verify:**

- [ ] Events are firing in PostHog dashboard
- [ ] User properties are updating
- [ ] Session recordings are capturing correctly
- [ ] Feature flags are working
- [ ] A/B tests are assigning variants
- [ ] Surveys are triggering
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Privacy settings are respected

---

## Resources Needed

**PostHog Account:**

- Cloud account (free tier)
- API keys
- Project setup

**Development:**

- PostHog SDK documentation
- React/Next.js examples
- TypeScript types

**Content Creation:**

- Screenshots from PostHog dashboard
- Screen recordings of implementation
- Code snippets
- Before/after comparisons

---

This completes the comprehensive PostHog integration roadmap for TaskFlow!

```

---

## Final File Structure
```

taskflow/
├── app/
│ ├── layout.tsx ✅
│ ├── page.tsx ✅
│ ├── providers.tsx (to be added)
│ └── globals.css ✅
├── components/
│ ├── task-form.tsx ✅
│ ├── task-list.tsx ✅
│ ├── task-item.tsx ✅
│ ├── task-filters.tsx ✅
│ ├── task-stats.tsx ✅
│ └── ui/ ✅ (shadcn components)
├── lib/
│ ├── types.ts ✅
│ ├── utils.ts ✅
│ ├── store.ts ✅
│ └── posthog.ts (to be added)
├── hooks/
│ └── use-tasks.ts ✅
├── POSTHOG_INTEGRATION.md ✅
└── README.md (to be created)
