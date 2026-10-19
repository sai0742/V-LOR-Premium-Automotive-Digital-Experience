import { defineConfig } from "@playwright/test";
import chromium from "@sparticuz/chromium";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";

// The restricted Arena network permits npm, but not Playwright's browser CDN.
// Unpack the Chromium package's companion Linux libraries for minimal runners.
const require = createRequire(import.meta.url);
const packageRoot = join(require.resolve("@sparticuz/chromium"), "../../");
const libraryDir = mkdtempSync(join(tmpdir(), "velore-browser-"));
const archive = join(libraryDir, "libraries.tar");
writeFileSync(
  archive,
  brotliDecompressSync(readFileSync(join(packageRoot, "bin/al2023.tar.br"))),
);
execFileSync("tar", ["xf", archive, "-C", libraryDir]);

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:5173",
    launchOptions: {
      executablePath: await chromium.executablePath(),
      args: chromium.args.filter((a) => a !== "--single-process"),
      env: {
        ...process.env,
        LD_LIBRARY_PATH: `${join(libraryDir, "lib")}:${process.env.LD_LIBRARY_PATH || ""}`,
      } as Record<string, string>,
    },
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
