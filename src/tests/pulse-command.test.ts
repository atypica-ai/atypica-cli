import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runPulseCommand } from "../commands/pulse.js";

function captureStdoutAsync(run: () => Promise<void>): Promise<string> {
  const chunks: string[] = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
    return true;
  }) as typeof process.stdout.write;

  return run()
    .then(() => chunks.join(""))
    .finally(() => {
      process.stdout.write = originalWrite;
    });
}

test("pulse list does not fetch per-item details by default", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.ATYPICA_API_KEY;
  const originalBaseUrl = process.env.ATYPICA_BASE_URL;
  const requestedUrls: string[] = [];

  process.env.ATYPICA_API_KEY = "atypica_test";
  process.env.ATYPICA_BASE_URL = "https://example.com/api";
  globalThis.fetch = async (input) => {
    const url = String(input);
    requestedUrls.push(url);

    if (url.startsWith("https://example.com/api/pulse?")) {
      return new Response(JSON.stringify({
        success: true,
        data: [
          {
            id: 6298,
            title: "Microsoft $10B Japan AI investment",
            content: "Microsoft's announced investment in Japanese AI data centers.",
            category: "AI Business",
            locale: "en-US",
            heatScore: 570.88,
            heatDelta: 0.84,
            createdAt: "2026-04-25T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
        },
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const output = await captureStdoutAsync(() => runPulseCommand(["list", "--limit", "10"], { json: false, updateCheck: false }));

    assert.equal(requestedUrls.length, 1);
    assert.match(requestedUrls[0] ?? "", /\/pulse\?/);
    assert.doesNotMatch(output, /\bSource\b/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.ATYPICA_API_KEY;
    } else {
      process.env.ATYPICA_API_KEY = originalApiKey;
    }
    if (originalBaseUrl === undefined) {
      delete process.env.ATYPICA_BASE_URL;
    } else {
      process.env.ATYPICA_BASE_URL = originalBaseUrl;
    }
  }
});

test("pulse list works without configured auth", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.ATYPICA_API_KEY;
  const originalBaseUrl = process.env.ATYPICA_BASE_URL;
  const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
  const requestedAuthorizations: Array<string | null> = [];

  delete process.env.ATYPICA_API_KEY;
  process.env.ATYPICA_BASE_URL = "https://example.com/api";
  process.env.XDG_CONFIG_HOME = mkdtempSync(join(tmpdir(), "atypica-cli-test-"));
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    requestedAuthorizations.push(new Headers(init?.headers).get("authorization"));

    if (url.startsWith("https://example.com/api/pulse?")) {
      return new Response(JSON.stringify({
        success: true,
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
        },
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    await captureStdoutAsync(() => runPulseCommand(["list", "--limit", "10"], { json: false, updateCheck: false }));

    assert.deepEqual(requestedAuthorizations, [null]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.ATYPICA_API_KEY;
    } else {
      process.env.ATYPICA_API_KEY = originalApiKey;
    }
    if (originalBaseUrl === undefined) {
      delete process.env.ATYPICA_BASE_URL;
    } else {
      process.env.ATYPICA_BASE_URL = originalBaseUrl;
    }
    if (originalXdgConfigHome === undefined) {
      delete process.env.XDG_CONFIG_HOME;
    } else {
      process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
    }
  }
});
