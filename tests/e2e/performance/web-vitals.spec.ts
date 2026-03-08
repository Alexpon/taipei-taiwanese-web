import { test, expect, type Page } from "@playwright/test";

// Thresholds are intentionally lenient for dev server (unoptimized builds).
// Tighten these when running against a production build.
const THRESHOLDS = {
  ttfb: 600, // Time to First Byte (ms)
  fcp: 3000, // First Contentful Paint (ms)
  lcp: 4000, // Largest Contentful Paint (ms)
  cls: 0.1, // Cumulative Layout Shift (unitless)
  domReady: 4000, // DOMContentLoaded (ms)
  pageLoad: 6000, // Full load event (ms)
};

const PUBLIC_PAGES = [
  { name: "Home", path: "/" },
  { name: "News", path: "/news" },
  { name: "Events", path: "/events" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

async function getNavigationMetrics(page: Page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(
      (e) => e.name === "first-contentful-paint"
    );
    return {
      ttfb: nav.responseStart - nav.fetchStart,
      domReady: nav.domContentLoadedEventEnd - nav.fetchStart,
      pageLoad: nav.loadEventEnd - nav.fetchStart,
      fcp: fcpEntry ? fcpEntry.startTime : null,
    };
  });
}

async function getLCP(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let resolved = false;
        new PerformanceObserver((list) => {
          if (resolved) return;
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolved = true;
            resolve(entries[entries.length - 1].startTime);
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
        // Fallback: resolve with -1 if LCP never fires (static pages without large content)
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(-1);
          }
        }, 3000);
      })
  );
}

async function getCLS(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!(entry as any).hadRecentInput) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cls += (entry as any).value;
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
        // Collect layout shifts for 2 seconds after page load
        setTimeout(() => resolve(cls), 2000);
      })
  );
}

test.describe("Public Page Performance", () => {
  // Run serially to avoid parallel metric noise
  test.describe.configure({ mode: "serial" });

  for (const { name, path } of PUBLIC_PAGES) {
    test.describe(name, () => {
      test("Navigation Timing: TTFB, DOM ready, full load", async ({
        page,
      }) => {
        await page.goto(path, { waitUntil: "load" });

        const metrics = await getNavigationMetrics(page);

        console.log(`[${name}] TTFB: ${metrics.ttfb.toFixed(0)}ms`);
        console.log(`[${name}] FCP: ${metrics.fcp?.toFixed(0) ?? "n/a"}ms`);
        console.log(`[${name}] DOM Ready: ${metrics.domReady.toFixed(0)}ms`);
        console.log(`[${name}] Full Load: ${metrics.pageLoad.toFixed(0)}ms`);

        expect(
          metrics.ttfb,
          `${name}: TTFB should be < ${THRESHOLDS.ttfb}ms`
        ).toBeLessThan(THRESHOLDS.ttfb);

        if (metrics.fcp !== null) {
          expect(
            metrics.fcp,
            `${name}: FCP should be < ${THRESHOLDS.fcp}ms`
          ).toBeLessThan(THRESHOLDS.fcp);
        }

        expect(
          metrics.domReady,
          `${name}: DOM ready should be < ${THRESHOLDS.domReady}ms`
        ).toBeLessThan(THRESHOLDS.domReady);

        expect(
          metrics.pageLoad,
          `${name}: Full load should be < ${THRESHOLDS.pageLoad}ms`
        ).toBeLessThan(THRESHOLDS.pageLoad);
      });

      test("Web Vitals: LCP", async ({ page }) => {
        await page.goto(path, { waitUntil: "load" });

        const lcp = await getLCP(page);

        if (lcp === -1) {
          console.log(`[${name}] LCP: not observed (no large content element)`);
          // Skip assertion if no LCP candidate found
          return;
        }

        console.log(`[${name}] LCP: ${lcp.toFixed(0)}ms`);
        expect(
          lcp,
          `${name}: LCP should be < ${THRESHOLDS.lcp}ms`
        ).toBeLessThan(THRESHOLDS.lcp);
      });

      test("Web Vitals: CLS", async ({ page }) => {
        await page.goto(path, { waitUntil: "load" });

        const cls = await getCLS(page);

        console.log(`[${name}] CLS: ${cls.toFixed(4)}`);
        expect(
          cls,
          `${name}: CLS should be < ${THRESHOLDS.cls}`
        ).toBeLessThan(THRESHOLDS.cls);
      });
    });
  }
});
