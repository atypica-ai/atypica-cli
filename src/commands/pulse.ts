import { ApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/auth.js";
import { resolveConfig } from "../lib/config.js";
import { CliError } from "../lib/errors.js";
import { printInfo } from "../lib/output.js";
import { extractTwitterSourceUrls, renderPulseCategories, renderPulseDetail, renderPulseList } from "../lib/pulse.js";
import { CliContext, PulseListItem } from "../types.js";

function parseFlags(args: string[]): Map<string, string | boolean> {
  const flags = new Map<string, string | boolean>();

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      flags.set(key, inlineValue);
      continue;
    }

    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      flags.set(key, true);
      continue;
    }

    flags.set(key, next);
    index += 1;
  }

  return flags;
}

function stringFlag(flags: Map<string, string | boolean>, key: string): string | undefined {
  const value = flags.get(key);
  return typeof value === "string" ? value : undefined;
}

function booleanFlag(flags: Map<string, string | boolean>, key: string): boolean {
  const value = flags.get(key);
  return value === true || value === "true";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(null))
      .finally(() => clearTimeout(timer));
  });
}

async function enrichPulseSources(
  client: ApiClient,
  items: PulseListItem[],
  concurrency = 4,
  timeoutMs = 2_000,
): Promise<Map<number, string | null>> {
  const sourceUrlsById = new Map<number, string | null>();
  const queue = [...items];

  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      const detail = await withTimeout(client.getPulse(String(item.id)), timeoutMs);
      const firstSource = detail ? extractTwitterSourceUrls(detail.data.posts)[0] ?? null : null;
      sourceUrlsById.set(item.id, firstSource);
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () => worker()));
  return sourceUrlsById;
}

export function printPulseHelp(): void {
  printInfo("Usage:");
  printInfo("  atypica pulse list [--category <name>] [--locale <en-US>] [--limit <n>] [--page <n>] [--order-by <heatScore|heatDelta|createdAt>] [--no-source-enrich]");
  printInfo("  atypica pulse categories [--locale <en-US>]");
  printInfo("  atypica pulse get <id>");
  printInfo("");
  printInfo("Subcommands:");
  printInfo("  list        List pulse items with date/summary/source and pagination footer");
  printInfo("  categories  List available pulse categories");
  printInfo("  get         Show full detail for one pulse, including full content and source URLs");
  printInfo("");
  printInfo("List options:");
  printInfo("  --category <name>                           Filter by exact category name");
  printInfo("  --locale <en-US>                            Filter by locale (zh-CN is temporarily unsupported)");
  printInfo("  --limit <n>                                 Page size (1-50)");
  printInfo("  --page <n>                                  Page number (>=1)");
  printInfo("  --order-by <heatScore|heatDelta|createdAt>  Sort field (desc, default heatScore)");
  printInfo("  --no-source-enrich                          Skip extra detail fetch for source link column");
  printInfo("");
  printInfo("Global flags:");
  printInfo("  --json                                      Output JSON for automation");
  printInfo("  --no-update-check                           Disable update check for this run");
  printInfo("");
  printInfo("Examples:");
  printInfo("  # 1) Basic list, first page");
  printInfo("  atypica pulse list --limit 10 --page 1");
  printInfo("");
  printInfo("  # 2) Filter by category + locale");
  printInfo("  atypica pulse list --category \"AI Tech\" --locale en-US --limit 20 --page 2");
  printInfo("");
  printInfo("  # 3) Sort by heat score, JSON mode (for scripts/agents)");
  printInfo("  atypica pulse list --order-by heatScore --limit 5 --json --no-update-check");
  printInfo("");
  printInfo("  # 4) Faster list (skip source enrichment)");
  printInfo("  atypica pulse list --limit 20 --no-source-enrich");
  printInfo("");
  printInfo("  # 5) Fetch one pulse detail");
  printInfo("  atypica pulse get 3396");
  printInfo("");
  printInfo("  # 6) Fetch one pulse detail in JSON");
  printInfo("  atypica pulse get 3396 --json");
  printInfo("");
  printInfo("  # 7) List categories");
  printInfo("  atypica pulse categories --locale en-US");
  printInfo("");
  printInfo("Agent tips:");
  printInfo("  - Use `--json` for machine-readable output");
  printInfo("  - `pulse list` default output includes Date, Summary, Source, and pagination footer");
  printInfo("  - Use `--no-source-enrich` to skip detail lookups and speed up list rendering");
  printInfo("  - Use `--no-update-check` in automation");
  printInfo("  - Set `ATYPICA_API_KEY` and `ATYPICA_BASE_URL` explicitly in CI or agent runtimes");
}

export async function runPulseCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === "help" || subcommand === "--help" || subcommand === "-h") {
    printPulseHelp();
    return;
  }

  const config = resolveConfig();
  const apiKey = requireApiKey(config);
  const client = new ApiClient({
    apiKey,
    baseUrl: config.baseUrl ?? "",
  });

  if (subcommand === "list") {
    const flags = parseFlags(rest);
    const params = new URLSearchParams();

    const locale = stringFlag(flags, "locale");
    if (locale === "zh-CN") {
      throw new CliError("Locale zh-CN is temporarily unsupported. Please use en-US.");
    }

    ["category", "locale", "limit", "page"].forEach((key) => {
      const value = stringFlag(flags, key);
      if (value) params.set(key, value);
    });

    const orderBy = stringFlag(flags, "order-by") ?? "heatScore";
    params.set("orderBy", orderBy);

    const response = await client.getPulseList(params);
    const shouldEnrichSource = !context.json && !booleanFlag(flags, "no-source-enrich");
    const sourceUrlsById = shouldEnrichSource ? await enrichPulseSources(client, response.data) : undefined;
    renderPulseList(response, { json: context.json, sourceUrlsById });
    return;
  }

  if (subcommand === "categories") {
    const flags = parseFlags(rest);
    const params = new URLSearchParams();
    const locale = stringFlag(flags, "locale");
    if (locale === "zh-CN") {
      throw new CliError("Locale zh-CN is temporarily unsupported. Please use en-US.");
    }
    if (locale) params.set("locale", locale);

    const response = await client.getPulseCategories(params);
    renderPulseCategories(response.data, context.json);
    return;
  }

  if (subcommand === "get") {
    const [id] = rest.filter((arg) => !arg.startsWith("--"));
    if (!id) {
      throw new CliError("Usage: atypica pulse get <id>");
    }

    const response = await client.getPulse(id);
    renderPulseDetail(response.data, context.json);
    return;
  }

  throw new CliError("Unknown pulse subcommand. Run `atypica pulse help` for detailed usage.");
}
