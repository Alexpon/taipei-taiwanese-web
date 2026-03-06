# Test Plan Design

## Overview

Comprehensive test plan for the Taipei Taiwanese CMS web application. Two-tier approach: Vitest for unit/integration tests, Playwright for E2E browser tests. Supabase Local (Docker) as the test database.

## Architecture

```
Vitest (fast, unit/integration)     Playwright (browser, E2E)
├── Server Actions logic            ├── Public pages navigation
├── Utility functions               ├── Admin login/logout flow
└── Component rendering             ├── News/Events CRUD
                                    ├── Pages editing
                                    ├── Media upload/delete
                                    └── Auth redirect behavior
```

Both layers run against Supabase Local (Docker) for real database queries and RLS validation.

## Directory Structure

```
tests/
├── unit/
│   ├── actions/
│   │   ├── news.test.ts
│   │   ├── events.test.ts
│   │   └── pages.test.ts
│   ├── lib/
│   │   └── utils.test.ts
│   └── setup.ts
├── e2e/
│   ├── public/
│   │   ├── home.spec.ts
│   │   ├── news.spec.ts
│   │   ├── events.spec.ts
│   │   ├── about.spec.ts
│   │   └── contact.spec.ts
│   ├── admin/
│   │   ├── login.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── news-crud.spec.ts
│   │   ├── events-crud.spec.ts
│   │   ├── pages-edit.spec.ts
│   │   └── media.spec.ts
│   ├── auth/
│   │   └── middleware.spec.ts
│   └── fixtures/
│       ├── auth.ts
│       └── db.ts
├── playwright.config.ts
└── vitest.config.ts
```

## npm Scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:all": "vitest run && playwright test"
}
```

## Vitest Unit/Integration Tests

### Server Actions (highest value)

**News Actions:**
- `createNews` — draft: `published_at` is null
- `createNews` — published: `published_at` set to current time
- `updateNews` — draft → published: sets `published_at`
- `updateNews` — published → draft: clears `published_at`
- `updateNews` — same status: preserves existing `published_at`
- `deleteNews` — deletes and calls `revalidatePath`

**Events Actions:**
- `createEvent` — correct insert with event_date, location
- `updateEvent` — correct update with registration_url
- `deleteEvent` — deletes and revalidates

**Pages Actions:**
- `updatePage` — updates content correctly
- `updatePage` — revalidates correct path (`/${slug}`)

**Strategy:** Mock `@/lib/supabase/server` createClient, verify Supabase query params and `revalidatePath`/`redirect` calls.

### Utility Functions

- `cn()` — merges class names correctly
- `cn()` — resolves Tailwind conflicts (e.g., `px-2` + `px-4` → `px-4`)

## Playwright E2E Tests

### Public Pages

**Home:**
- Page loads with hero section
- Shows up to 3 latest news cards
- Shows up to 3 upcoming event cards
- Empty state text when no data
- Navigation links work correctly

**News:**
- List shows all published news
- Click navigates to detail page
- Detail shows title, content, cover image
- Non-existent ID shows 404
- Draft news not visible in list

**Events:**
- List shows all published events
- Detail shows date, location, registration link (if any)
- Cover image loads correctly

**About & Contact:**
- Pages load and render Tiptap HTML content
- Contact page has map section

### Auth & Authorization

**Middleware:**
- Unauthenticated `/admin` → redirect to `/admin/login`
- Unauthenticated `/admin/news` → redirect to `/admin/login`
- Authenticated `/admin/login` → redirect to `/admin`
- Login success → redirect to `/admin`
- Login failure → error message displayed
- Logout → redirect to `/admin/login`

### Admin CRUD

**News CRUD:**
- List shows all news (including drafts)
- Create news (title, content, cover image) → visible in list
- Edit news → content correctly updated
- Toggle draft/published status
- Delete news → confirm dialog → removed from list
- Tiptap editor accepts text and formatting

**Events CRUD:**
- Same as News, plus event_date, location, registration_url fields
- Date picker works correctly

**Pages Edit:**
- List shows only seeded pages (about, contact)
- Edit page content → save → shows success message
- Public page reflects updated content after save

**Media:**
- Upload image → appears in list
- Copy URL → clipboard contains correct URL
- Delete image → confirm dialog → removed from list
- Non-image file upload rejected

### Shared Fixtures

**`auth.ts`:**
- `adminLogin()` — login with test credentials, save auth state for reuse via `storageState`

**`db.ts`:**
- `seedTestData()` — insert test data into Supabase Local (using service role key to bypass RLS)
- `cleanupTestData()` — clean up test data after tests

## Test Environment

### Supabase Local (Docker)

```bash
supabase start  # Starts local Supabase, applies migrations automatically
```

### Environment Variables (`.env.test`)

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-local-service-role-key>
```

### Playwright Config Highlights

- `webServer`: auto-starts `npm run dev` before tests
- `baseURL`: `http://localhost:3000`
- Chromium only (can add Firefox/WebKit later)
- `storageState`: reuse login session across tests

### Vitest Config Highlights

- `@vitejs/plugin-react` for JSX support
- Path alias `@/*` → `src/*` matching tsconfig
- Mock modules: `@/lib/supabase/server`, `next/cache`, `next/navigation`

## Dependencies to Install

```
# Vitest
vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom

# Playwright
@playwright/test
```

## Future Enhancements (out of scope for now)

- Performance: Lighthouse CI scoring
- Security: OWASP headers check, XSS prevention validation
- Accessibility: axe-core integration
- CI/CD: GitHub Actions workflow
- Multi-browser: Firefox and WebKit
