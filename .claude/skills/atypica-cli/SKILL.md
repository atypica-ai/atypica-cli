---
name: atypica-cli
version: 0.1.0
description: "Use this skill when you need to fetch summarized real-time hot topics (AI, tech, business, global news, Web3, science, etc.). atypica CLI is the command-line client for the atypica Pulse API, providing structured trending stories, full content, and aggregated source posts."
metadata:
  requires:
    bins: ["atypica"]
  cliHelp: "atypica help"
---

# atypica CLI

**Purpose:** Quickly fetch curated, summarized real-time hot topics (Pulse) from the atypica platform. Every Pulse includes a title, summary, heat score, category, locale, and aggregated original social source posts.

## Installation

```bash
npm install -g @atypica/cli
```

Verify the installation:

```bash
atypica help
```

## Authentication

The CLI requires a valid Personal API Key.

**Option A — Interactive login (recommended for first-time setup):**

```bash
atypica auth login
```

This will:
- Open your browser to the API keys page (optional)
- Prompt you to paste your Personal API Key
- Save it locally and validate it with a live API call

**Option B — Environment variable (recommended for agents / CI / automation):**

```bash
export ATYPICA_API_KEY="atypica_xxx"
```

Environment variables override the saved local config at runtime.

**Check current auth state:**

```bash
atypica auth status
```

**Remove saved local key:**

```bash
atypica auth logout
```

## Core Commands

### 1. List trending pulses

```bash
# Basic list
atypica pulse list --limit 10 --page 1

# Filter by category and locale
atypica pulse list --category "AI Tech" --locale en-US --limit 20 --page 2

# Sort by heat score in JSON mode (for scripts/agents)
atypica pulse list --order-by heatScore --limit 5 --json

# Faster list (skip source enrichment)
atypica pulse list --limit 20 --no-source-enrich
```

**List options:**
- `--category <name>` — exact category name
- `--locale <en-US>` — locale filter (zh-CN is temporarily unsupported)
- `--limit <n>` — page size (1–50)
- `--page <n>` — page number (≥1)
- `--order-by <heatScore|heatDelta|createdAt>` — sort field (descending)
- `--no-source-enrich` — skip extra detail fetch for source links (faster)
- `--json` — machine-readable JSON output

**Table output columns:** ID, Category, Locale, Date, Heat, Delta, Source, Title, Summary

**JSON output structure:**

```json
{
  "success": true,
  "data": [
    {
      "id": 2918,
      "title": "US Pilot Rescue Uranium Claim",
      "content": "Today's surge comes from...",
      "category": "Global News",
      "locale": "en-US",
      "heatScore": 453.2,
      "heatDelta": null,
      "createdAt": "2026-04-06T14:00:41.195Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 863
  }
}
```

### 2. Fetch a single pulse in full detail

```bash
# Fetch one pulse detail
atypica pulse get 3396

# Fetch one pulse detail in JSON
atypica pulse get 3396 --json
```

The `get` command returns the complete content and an array of `posts` (original social source posts). Each post contains:
- `url`, `author`, `content`
- `likes`, `views`, `replies`, `retweets`

### 3. List available categories

```bash
atypica pulse categories --locale en-US
```

Typical categories include:
- `AI Business`
- `AI Tech`
- `Business`
- `Consumer Trends`
- `Global News`
- `Science`
- `Web3 & Crypto`

## Use Cases & Workflows

### Use Case A: Daily Trending Brief — Top 10 AI stories

**Scenario:** You need a quick morning briefing of the most-discussed AI stories.

**Command:**
```bash
ATYPICA_API_KEY="atypica_xxx" \
atypica pulse list --category "AI Tech" --order-by heatScore --limit 10 --json
```

**What you get:**
- Top 10 AI Tech pulses sorted by heat score
- Each item includes title, summary, and date
- JSON is easy to feed into a summarizer or newsletter generator

### Use Case B: Competitive Monitoring — Track a specific story across sources

**Scenario:** A headline caught your attention and you want to see the original social posts driving the conversation.

**Command:**
```bash
ATYPICA_API_KEY="atypica_xxx" \
atypica pulse get 2918 --json
```

**What you get:**
- Full narrative content
- `posts` array with every tracked original post, including engagement metrics (likes, views, retweets)
- Use this to gauge sentiment, identify influencers, or verify claims

### Use Case C: Research Export — Batch pull all Science pulses

**Scenario:** You are doing research and need the latest Science category updates.

**Command:**
```bash
ATYPICA_API_KEY="atypica_xxx" \
atypica pulse list --category "Science" --limit 50 --json
```

**What you get:**
- Up to 50 Science pulses in one call
- Use `pagination.total` to decide if you need additional pages

### Use Case D: Fast Dashboard Feed — Skip heavy source lookups

**Scenario:** You are building a real-time dashboard and only need titles, summaries, and heat scores.

**Command:**
```bash
ATYPICA_API_KEY="atypica_xxx" \
atypica pulse list --limit 30 --no-source-enrich --json
```

**What you get:**
- Faster response time because source-link enrichment is skipped
- Lighter JSON payload perfect for dashboard rendering

### Use Case E: Cross-Category Discovery — Browse available categories first

**Scenario:** You are unsure which category fits your interest.

**Command:**
```bash
ATYPICA_API_KEY="atypica_xxx" \
atypica pulse categories --locale en-US
```

**What you get:**
- A plain list of exact category names
- Use the exact name in subsequent `--category` filters

## JSON Mode & Agent Best Practices

- **Always use `--json`** when another tool or agent will parse the output.
- **Prefer environment variables over interactive auth** in CI and agent runtimes.
- **Set explicit filters** (`--limit`, `--locale`, `--order-by`, `--category`) for deterministic results.
- **Treat non-zero exit codes as failures:**
  - Exit code `2` — missing or invalid API key
  - Exit code `1` — bad argument (e.g., invalid pulse ID) or resource not found

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ATYPICA_API_KEY` | Personal API key; overrides local config at runtime |
| `ATYPICA_BASE_URL` | API base URL; defaults to `https://atypica.ai/api` |
| `ATYPICA_UPDATE_CHECK=0` | Globally disable the background update check |

## Help Commands

- `atypica help`
- `atypica pulse help`
- `atypica auth help`
