# Travel Book frontend structure

## Current transition

The project started as a single interactive UX prototype. It is now being moved toward a production-friendly structure without changing the approved flows.

## Target folders

```text
app/                       Next.js routes only
src/components/            Shared visual components
src/features/              Feature-specific UI and state
src/lib/                   Storage, formatting, routing and API helpers
src/types/                 Shared domain types
```

## Rules

1. Route files should compose feature components instead of containing all business logic.
2. Browser storage access must go through `src/lib/storage.ts`.
3. Storage keys must be declared in `src/lib/storage-keys.ts`.
4. Shared domain shapes must live in `src/types`.
5. New code must not add more DOM-query bridges. Existing bridge behavior will be removed feature by feature.
6. Every change must pass `npm run typecheck` and `npm run build` in CI.

## Refactor order

1. Validation scripts and CI.
2. Shared storage and domain types.
3. Date voting, itinerary and trip settings.
4. Home dashboard and navigation.
5. Checklist, places, members and memories.
6. Replace localStorage adapters with Supabase repositories.
