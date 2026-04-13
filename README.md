# atypica CLI

English README. For Simplified Chinese, see [README.zh-CN.md](./README.zh-CN.md).

`atypica` is a command line client for the atypica open API.

Current v1 scope:

- Read Pulse data from `https://atypica.ai/api`
- Guide users through generating and saving a Personal API Key
- Support both human-readable output and stable `--json` output
- Check for newer CLI versions and provide a self-update command

## Install

```bash
npm install -g @atypica/cli
```

Or:

```bash
pnpm add -g @atypica/cli
```

## Quick Start

Interactive login:

```bash
atypica auth login
```

This flow will:

- Point the user to `https://atypica.ai/account/api-keys`
- Optionally open the browser
- Prompt for a Personal API Key
- Save the key locally
- Validate the key with a real API call

Check current auth state:

```bash
atypica auth status
```

If you already have a key and want to avoid local state, use environment variables:

```bash
export ATYPICA_API_KEY="atypica_xxx"
atypica pulse list --limit 5
```

## Commands

List pulses:

```bash
atypica pulse list --limit 5 --locale en-US
```

Skip source enrichment lookups for faster list output:

```bash
atypica pulse list --limit 20 --page 2 --no-source-enrich
```

Filter by category:

```bash
atypica pulse list --category "AI Tech" --order-by heatScore
```

List categories:

```bash
atypica pulse categories --locale en-US
```

Fetch one pulse:

```bash
atypica pulse get 193
```

Script-friendly mode:

```bash
atypica pulse list --limit 3 --json
```

Detailed command help:

```bash
atypica help
atypica auth help
atypica pulse help
```

## Agent Usage

The CLI is designed to be easy for other agents and automation systems to call.

Recommendations:

- Use `--json` whenever another tool or agent will parse the output.
- Pass `--no-update-check` in automation to avoid extra stderr noise.
- Prefer environment variables over interactive auth in CI:

```bash
ATYPICA_API_KEY="atypica_xxx" \
ATYPICA_BASE_URL="https://atypica.ai/api" \
atypica pulse list --limit 10 --json --no-update-check
```

- For deterministic queries, always set explicit filters such as `--limit`, `--locale`, and `--order-by`.
- Treat non-zero exit codes as failures. Missing auth returns a non-zero exit code and a clear error message.

## Update

The CLI performs a non-blocking update check during normal usage.

Manual update:

```bash
atypica self-update
atypica self-update --yes
```

Disable the update check for one run:

```bash
atypica pulse list --no-update-check
```

## Configuration

Default config file location:

- macOS/Linux: `~/.config/atypica/config.json`
- If `XDG_CONFIG_HOME` is set: `$XDG_CONFIG_HOME/atypica/config.json`

Supported environment variables:

- `ATYPICA_API_KEY`
- `ATYPICA_BASE_URL`
- `ATYPICA_UPDATE_CHECK=0`

Default base URL:

```text
https://atypica.ai/api
```

Environment variables override the saved local config at runtime.

## Example Output

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
  "posts": []
}
```

## Development

```bash
npm install
npm run build
node --test dist/tests/*.test.js
node dist/cli.js help
```

## Docs

- Pulse docs: `https://atypica.ai/docs/pulse`
- Developer docs: `https://atypica.ai/docs`

## Skills

This repo also includes a `SKILL.md` for agent use. If you're building an agent that needs to interact with atypica APIs, you can reference it directly.
