
![head-image](./head-image.webp)

# Atypica CLI

**Use the terminal to see what the world is talking about.**

[atypica.ai](https://atypica.ai) is an AI agent for business research.  
This CLI is the official command-line client for the **Pulse** API, and Pulse is only the first step in the broader atypica product roadmap.  
Pulse tracks how attention moves across the web so you can spot signals worth following before they fade.

**Who it’s for**

- **Creators** — find timely topics with real momentum  
- **Researchers** — follow domains like AI, global news, or business  
- **Developers & agents** — pipe trend data into scripts and automation  

简体中文: [README.zh-CN.md](./README.zh-CN.md)

---

## Available skill

For better results, use this CLI together with the `atypica-pulse` skill:

```bash
npx skills add https://github.com/atypica-ai/atypica-cli --skill atypica-pulse
```

---


## Install

```bash
npm install -g @atypica-ai/cli
```

Or with pnpm:

```bash
pnpm add -g @atypica-ai/cli
```

Requires **Node.js 20+**.

---

## 30-second quick start

```bash
atypica auth login                              # sign in and save your API key
atypica pulse list --limit 5 --locale zh-CN     # latest Chinese trending items
atypica pulse get 3396                          # one pulse by ID (replace with a real ID)
```

Check auth without logging in again:

```bash
atypica auth status
```

If you already have a key and prefer not to use saved config:

```bash
export ATYPICA_API_KEY="atypica_xxx"
atypica pulse list --limit 5
```

---

## What this CLI does (v1)

- Reads Pulse data from `https://atypica.ai/api` (override with `ATYPICA_BASE_URL`)
- Walks you through creating a **Personal API Key** and stores it locally
- **Human-readable** tables by default, plus stable **`--json`** for scripts
- Optional **version check** and **`atypica self-update`**

---

## Commands

List pulses:

```bash
atypica pulse list --limit 5 --locale en-US
```

Faster list (skip extra source lookups):

```bash
atypica pulse list --limit 20 --page 2 --no-source-enrich
```

Filter by category and sort:

```bash
atypica pulse list --category "AI Tech" --order-by heatScore
```

Surface sudden breakout topics:

```bash
atypica pulse list --order-by heatDelta --limit 10
```

List categories:

```bash
atypica pulse categories --locale en-US
```

Fetch one pulse:

```bash
atypica pulse get 193
```

Fetch one pulse with machine-readable heat history:

```bash
atypica pulse get 193 --json
```

Machine-readable output:

```bash
atypica pulse list --limit 3 --json
```

Help:

```bash
atypica help
atypica auth help
atypica pulse help
```

---

## Agent & automation

The CLI is meant to be called from other tools and agents.

- Use **`--json`** whenever something else will parse the output  
- Use **`--no-update-check`** in CI to avoid extra stderr noise  
- Prefer **environment variables** over interactive login in automation:

```bash
ATYPICA_API_KEY="atypica_xxx" \
ATYPICA_BASE_URL="https://atypica.ai/api" \
atypica pulse list --limit 10 --json --no-update-check
```

- Set explicit **`--limit`**, **`--locale`**, and **`--order-by`** when you need repeatable results  
- Use **`--order-by heatDelta`** when you want breakout topics ranked by delta instead of total heat score  
- **Non-zero exit code** means failure (including missing or invalid auth)

---

## Updates

The CLI runs a **non-blocking** update check during normal use.

Manual upgrade:

```bash
atypica self-update
atypica self-update --yes
```

Skip the check for one run:

```bash
atypica pulse list --no-update-check
```

---

## Configuration

Default config file:

- macOS / Linux: `~/.config/atypica/config.json`  
- If `XDG_CONFIG_HOME` is set: `$XDG_CONFIG_HOME/atypica/config.json`

Environment variables (override saved config at runtime):

| Variable | Purpose |
|----------|---------|
| `ATYPICA_API_KEY` | Personal API key |
| `ATYPICA_BASE_URL` | API base (default below) |
| `ATYPICA_UPDATE_CHECK=0` | Disable update check |

Default base URL:

```text
https://atypica.ai/api
```

---

## Example output

```bash
$ atypica pulse list --limit 3 --locale en-US
ID    Category     Locale  Date        Heat    Delta   Source                          Title                              Summary
----  -----------  ------  ----------  ------  ------  ------------------------------  ---------------------------------  ---------------------------------
2918  Global News  en-US   2026-04-12  453.20  +7.40   https://x.com/.../status/123   US Pilot Rescue Uranium Claim      Rescue claim triggers new debate…
2940  AI Business  en-US   2026-04-12  262.90  -       https://twitter.com/.../456    OpenAI Codex plugin for Claude     New plugin connects Claude tools…
3396  AI Tech      en-US   2026-04-12  323.67  +4.08   -                               bitnet.cpp: Microsoft 1-bit AI…    1-bit inference benchmark update…

Page 1/28  ·  Total 278  ·  PageSize 3  ·  Prev no  ·  Next yes
Tip: atypica pulse list --page 2 --limit 3
```

```bash
$ atypica pulse get 3396 --json
{
  "id": 3396,
  "title": "bitnet.cpp: Microsoft 1-bit AI inference",
  "content": "...",
  "category": "AI Tech",
  "locale": "en-US",
  "heatScore": 323.6711869385739,
  "heatDelta": null,
  "createdAt": "2026-04-10T14:00:39.241Z",
  "history": [
    {
      "date": "2026-04-09",
      "heatScore": 280.1
    },
    {
      "date": "2026-04-10",
      "heatScore": 323.6711869385739
    }
  ],
  "posts": []
}
```

---

## Development

```bash
npm install
npm run build
npm test
node dist/cli.js help
```

(You can use `pnpm install` / `pnpm run build` / `pnpm test` if you prefer.)

---

## Documentation

- Pulse: `https://atypica.ai/docs/pulse`  
- Developer hub: `https://atypica.ai/docs`
