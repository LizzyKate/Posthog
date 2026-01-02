# PostHog post-wizard report

The wizard has completed a deep integration of your TaskFlow Next.js application with PostHog analytics. The integration includes:

- **Client-side initialization** using the recommended `instrumentation-client.ts` approach for Next.js 16+ (15.3+)
- **Server-side PostHog client** setup for potential backend event tracking
- **10 custom events** tracking key user actions across task management workflows
- **Automatic pageview and session recording** via PostHog defaults
- **Error tracking** enabled via `capture_exceptions: true`

## Files Created

| File | Purpose |
|------|---------|
| `.env` | Environment variables for PostHog API key and host |
| `instrumentation-client.ts` | Client-side PostHog initialization |
| `lib/posthog-server.ts` | Server-side PostHog client for backend tracking |

## Files Modified

| File | Changes |
|------|---------|
| `components/task-components/task-form.tsx` | Added event tracking for task creation funnel |
| `components/task-components/task-item.tsx` | Added event tracking for task completion and deletion |
| `components/task-components/task-filters.tsx` | Added event tracking for filter and search usage |

## Events Tracked

| Event Name | Description | File |
|------------|-------------|------|
| `task_created` | User creates a new task - key conversion event indicating active usage | `components/task-components/task-form.tsx` |
| `task_completed` | User marks a task as completed - conversion event showing task completion engagement | `components/task-components/task-item.tsx` |
| `task_uncompleted` | User marks a completed task as incomplete - engagement metric | `components/task-components/task-item.tsx` |
| `task_deleted` | User deletes a task - potential churn indicator if excessive | `components/task-components/task-item.tsx` |
| `completed_tasks_cleared` | User clears all completed tasks - engagement and cleanup behavior | `components/task-components/task-filters.tsx` |
| `filter_changed` | User changes task filter (all/active/completed) - feature usage metric | `components/task-components/task-filters.tsx` |
| `task_searched` | User searches for tasks - feature engagement metric | `components/task-components/task-filters.tsx` |
| `add_task_dialog_opened` | User opens the add task dialog - top of task creation funnel | `components/task-components/task-form.tsx` |
| `add_task_dialog_cancelled` | User cancels task creation - potential friction indicator | `components/task-components/task-form.tsx` |
| `task_form_submitted_empty` | User tries to submit form without title - UX friction indicator | `components/task-components/task-form.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard

- [Analytics basics](https://us.posthog.com/project/267286/dashboard/929275) - Core analytics dashboard for TaskFlow app

### Insights

- [Task Creation Funnel](https://us.posthog.com/project/267286/insights/W587GbOE) - Tracks the conversion from opening the task dialog to successfully creating a task
- [Task Completion Rate](https://us.posthog.com/project/267286/insights/apaLscsB) - Shows the trend of tasks being completed over time
- [Task Deletion (Churn Indicator)](https://us.posthog.com/project/267286/insights/MoprAOsR) - Monitors task deletions which may indicate user frustration
- [Feature Usage - Filters & Search](https://us.posthog.com/project/267286/insights/RoClhyEB) - Tracks usage of filter and search features
- [Tasks by Category](https://us.posthog.com/project/267286/insights/DnHQEFrz) - Breakdown of task creation by category

## Getting Started

1. Run your development server: `npm run dev`
2. Interact with your app to generate events
3. View your analytics at [PostHog](https://us.posthog.com)

## Configuration

Your PostHog configuration uses environment variables:

```
NEXT_PUBLIC_POSTHOG_KEY=<your-api-key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Make sure to add these to your production environment as well.
