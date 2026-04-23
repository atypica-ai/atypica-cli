import assert from "node:assert/strict";
import test from "node:test";
import { extractTwitterSourceUrls, renderPulseDetail, renderPulseList } from "../lib/pulse.js";
import { PulseDetail, PulseListResponse } from "../types.js";

function captureStdout(run: () => void): string {
  const chunks: string[] = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
    return true;
  }) as typeof process.stdout.write;

  try {
    run();
    return chunks.join("");
  } finally {
    process.stdout.write = originalWrite;
  }
}

test("extractTwitterSourceUrls deduplicates x/twitter URLs", () => {
  const urls = extractTwitterSourceUrls([
    {
      url: "https://x.com/user/status/123",
      content: "Primary source",
    },
    {
      payload: {
        source: "https://twitter.com/other/status/456",
        repeated: "https://x.com/user/status/123/",
      },
    },
  ]);

  assert.deepEqual(urls, ["https://x.com/user/status/123", "https://twitter.com/other/status/456"]);
});

test("renderPulseList JSON mode keeps pagination shape", () => {
  const response: PulseListResponse = {
    success: true,
    data: [
      {
        id: 1,
        title: "Sample title",
        content: "Detailed content",
        category: "AI Tech",
        locale: "en-US",
        heatScore: 100,
        heatDelta: 5,
        createdAt: "2026-04-12T00:00:00.000Z",
      },
    ],
    pagination: {
      page: 2,
      pageSize: 10,
      total: 25,
    },
  };

  const output = captureStdout(() => {
    renderPulseList(response, { json: true });
  });
  const parsed = JSON.parse(output) as PulseListResponse;
  assert.equal(parsed.pagination.page, 2);
  assert.equal(parsed.pagination.total, 25);
  assert.equal(parsed.data[0]?.id, 1);
});

test("renderPulseDetail JSON mode preserves history payload", () => {
  const detail: PulseDetail = {
    id: 3396,
    title: "Sample pulse",
    content: "Detailed content",
    category: "AI Tech",
    locale: "en-US",
    heatScore: 323.67,
    heatDelta: 0.12,
    createdAt: "2026-04-10T14:00:39.241Z",
    history: [
      { date: "2026-04-09", heatScore: 280.1 },
      { date: "2026-04-10", heatScore: 323.67 },
    ],
    posts: [],
    opinionSummary: {
      summary: "Most discussion is optimistic, but pricing power remains disputed.",
      overallSentiment: "mixed",
      keyViewpoints: [
        { stance: "Bullish", summary: "Supporters expect rapid enterprise rollout." },
      ],
      controversies: ["Whether demand is durable beyond early adopters."],
      generatedAt: "2026-04-10T14:10:00.000Z",
    },
  };

  const output = captureStdout(() => {
    renderPulseDetail(detail, true);
  });
  const parsed = JSON.parse(output) as PulseDetail;
  assert.deepEqual(parsed.history, detail.history);
  assert.deepEqual(parsed.opinionSummary, detail.opinionSummary);
});

test("renderPulseDetail plain mode prints heat trend points", () => {
  const detail: PulseDetail = {
    id: 3396,
    title: "Sample pulse",
    content: "Detailed content",
    category: "AI Tech",
    locale: "en-US",
    heatScore: 323.67,
    heatDelta: 0.12,
    createdAt: "2026-04-10T14:00:39.241Z",
    history: [
      { date: "2026-04-10", heatScore: 323.67 },
      { date: "2026-04-09", heatScore: 280.1 },
    ],
    posts: [],
    opinionSummary: {
      summary: "Conversation is broadly constructive, with concerns around reliability.",
      overallSentiment: "mixed",
      keyViewpoints: [
        { stance: "Positive", summary: "Teams see near-term productivity gains." },
        { stance: "Skeptical", summary: "Critics think quality is still inconsistent." },
      ],
      controversies: ["Whether current product quality is production-ready."],
      generatedAt: "2026-04-10T14:10:00.000Z",
    },
  };

  const output = captureStdout(() => {
    renderPulseDetail(detail, false);
  });

  assert.match(output, /Heat Trend \(2\):/);
  assert.match(output, /2026-04-09/);
  assert.match(output, /2026-04-10/);
  assert.match(output, /Opinion:/);
  assert.match(output, /Overall Sentiment:\s+Mixed/);
  assert.match(output, /Key Viewpoints \(2\):/);
  assert.match(output, /Positive:\s+Teams see near-term productivity gains\./);
  assert.match(output, /Controversies \(1\):/);
});
