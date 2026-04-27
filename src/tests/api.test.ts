import test from "node:test";
import assert from "node:assert/strict";
import { ApiClient } from "../lib/api.js";
import { HttpError } from "../lib/errors.js";

test("ApiClient converts error payload into HttpError", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: false, message: "Unauthorized: Invalid API key" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });

  const client = new ApiClient({
    apiKey: "atypica_test",
    baseUrl: "https://example.com/api",
  });

  await assert.rejects(() => client.getPulse("1"), (error: unknown) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 401);
    assert.equal(error.message, "Unauthorized: Invalid API key");
    return true;
  });

  globalThis.fetch = originalFetch;
});

test("ApiClient omits Authorization header when apiKey is not configured", async () => {
  const originalFetch = globalThis.fetch;
  let authorization: string | null = "unset";

  globalThis.fetch = async (_input, init) => {
    const headers = new Headers(init?.headers);
    authorization = headers.get("authorization");

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: 1,
        title: "Test pulse",
        content: "Anonymous request",
        category: "AI Tech",
        locale: "en-US",
        heatScore: 1,
        heatDelta: 0,
        createdAt: "2026-04-25T00:00:00.000Z",
        posts: [],
        history: [],
      },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const client = new ApiClient({
    baseUrl: "https://example.com/api",
  });

  await client.getPulse("1");

  assert.equal(authorization, null);
  globalThis.fetch = originalFetch;
});
