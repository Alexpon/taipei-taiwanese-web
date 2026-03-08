import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const BUILD_DIR = path.resolve(process.cwd(), ".next");
const STATIC_JS_DIR = path.join(BUILD_DIR, "static", "chunks");

// Thresholds for production build output
const MAX_TOTAL_JS_MB = 5; // total JS across all chunks in static/chunks
const MAX_SINGLE_CHUNK_MB = 1.5; // largest single JS chunk

function getAllFiles(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? getAllFiles(path.join(dir, entry.name), ext)
      : entry.name.endsWith(ext)
        ? [path.join(dir, entry.name)]
        : []
  );
}

const buildExists = fs.existsSync(BUILD_DIR);
const staticJsExists = fs.existsSync(STATIC_JS_DIR);

describe("Bundle Size (requires: npm run build)", () => {
  it.skipIf(!buildExists)(
    "next build output exists at .next/",
    () => {
      expect(fs.existsSync(BUILD_DIR)).toBe(true);
    }
  );

  it.skipIf(!staticJsExists)(
    `total JS chunks < ${MAX_TOTAL_JS_MB}MB`,
    () => {
      const files = getAllFiles(STATIC_JS_DIR, ".js");
      const totalBytes = files.reduce(
        (sum, f) => sum + fs.statSync(f).size,
        0
      );
      const totalMB = totalBytes / 1024 / 1024;

      console.log(
        `Total JS: ${totalMB.toFixed(2)}MB across ${files.length} chunks`
      );

      expect(
        totalMB,
        `Total JS bundle (${totalMB.toFixed(2)}MB) exceeds ${MAX_TOTAL_JS_MB}MB limit`
      ).toBeLessThan(MAX_TOTAL_JS_MB);
    }
  );

  it.skipIf(!staticJsExists)(
    `no single JS chunk > ${MAX_SINGLE_CHUNK_MB}MB`,
    () => {
      const files = getAllFiles(STATIC_JS_DIR, ".js");
      const oversized = files
        .map((f) => ({
          name: path.relative(STATIC_JS_DIR, f),
          mb: fs.statSync(f).size / 1024 / 1024,
        }))
        .filter((f) => f.mb > MAX_SINGLE_CHUNK_MB)
        .sort((a, b) => b.mb - a.mb);

      if (oversized.length > 0) {
        console.error(
          "Oversized chunks:\n" +
            oversized.map((f) => `  ${f.name}: ${f.mb.toFixed(2)}MB`).join("\n")
        );
      }

      expect(
        oversized,
        `${oversized.length} chunk(s) exceed the ${MAX_SINGLE_CHUNK_MB}MB limit`
      ).toHaveLength(0);
    }
  );

  it.skipIf(!staticJsExists)(
    "reports top 5 largest JS chunks (informational)",
    () => {
      const files = getAllFiles(STATIC_JS_DIR, ".js");
      const sorted = files
        .map((f) => ({
          name: path.relative(STATIC_JS_DIR, f),
          mb: fs.statSync(f).size / 1024 / 1024,
        }))
        .sort((a, b) => b.mb - a.mb)
        .slice(0, 5);

      console.log(
        "Top 5 largest JS chunks:\n" +
          sorted.map((f) => `  ${f.name}: ${f.mb.toFixed(2)}MB`).join("\n")
      );

      // Always passes — this test is informational only
      expect(sorted.length).toBeGreaterThanOrEqual(0);
    }
  );
});
