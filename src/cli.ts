#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { printAuthHelp, runAuthCommand } from "./commands/auth.js";
import { printPulseHelp, runPulseCommand } from "./commands/pulse.js";
import { runSelfUpdateCommand } from "./commands/self-update.js";
import { resolveConfig } from "./lib/config.js";
import { CliError } from "./lib/errors.js";
import { maybeNotifyForUpdates } from "./lib/update.js";
import {
  highlightCategory,
  highlightHeat,
  highlightLink,
  highlightMuted,
  highlightTitle,
  printError,
  printInfo,
} from "./lib/output.js";
import { CliContext } from "./types.js";

async function readVersion(): Promise<string> {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(currentDir, "..", "package.json");
  const content = await readFile(pkgPath, "utf8");
  return (JSON.parse(content) as { version: string }).version;
}

function extractGlobalFlags(argv: string[]): { context: CliContext; args: string[] } {
  const args: string[] = [];
  let json = false;
  let updateCheck = true;

  for (const arg of argv) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--no-update-check") {
      updateCheck = false;
      continue;
    }

    args.push(arg);
  }

  return {
    context: { json, updateCheck },
    args,
  };
}

function printHelp(): void {
  const cmd = (text: string) => highlightTitle(text);
  const section = (text: string) => highlightCategory(text);
  const tip = (text: string) => highlightMuted(text);
  const value = (text: string) => highlightHeat(text);
  const link = (text: string) => highlightLink(text);

  printInfo(highlightTitle("atypica CLI"));
  printInfo("");
  printInfo(section("Usage:"));
  printInfo(`  ${cmd("atypica")} <command> <subcommand> [options]`);
  printInfo("");
  printInfo(section("Core commands:"));
  printInfo(`  ${cmd("auth")}         Configure and inspect Personal API Key access`);
  printInfo(`  ${cmd("pulse")}        Query Pulse categories, lists, and details`);
  printInfo(`  ${cmd("self-update")}  Print or run the recommended upgrade command`);
  printInfo(`  ${cmd("help")}         Show global or command-specific help`);
  printInfo("");
  printInfo(section("Global flags:"));
  printInfo(`  ${value("--json")}             Output machine-readable JSON when supported`);
  printInfo(`  ${value("--no-update-check")}  Disable the background version check for this run`);
  printInfo("");
  printInfo(section("Examples:"));
  printInfo(`  ${cmd("atypica auth login")}`);
  printInfo(`  ${cmd("atypica pulse list --limit 5 --locale en-US")}`);
  printInfo(`  ${cmd("atypica pulse get 3396 --json --no-update-check")}`);
  printInfo("");
  printInfo(section("What atypica gives you:"));
  printInfo(`  - ${tip("Pulse trend signals and global news coverage in one feed")}`);
  printInfo(`  - ${tip("AI-generated summaries for each pulse to speed up understanding")}`);
  printInfo(`  - ${tip("Breakout detection via")} ${value("heatDelta")} ${tip("to surface suddenly exploding topics")}`);
  printInfo(`  - ${tip("Per-pulse")} ${value("history")} ${tip("to inspect recent heat curves day by day")}`);
  printInfo(`  - ${tip("Traceable source posts, including original X / Twitter links")}`);
  printInfo("");
  printInfo(section("Agent tips:"));
  printInfo(`  - ${tip(`Use ${value("--json")} for downstream parsing`)}`);
  printInfo(`  - ${tip(`Use ${cmd("atypica pulse list --order-by heatDelta")} to find sudden breakouts`)}`);
  printInfo(`  - ${tip(`Use ${cmd("atypica pulse get <id> --json")} to retrieve the raw ${value("history")} series`)}`);
  printInfo(`  - ${tip(`Prefer env-based auth in automation: ${cmd("ATYPICA_API_KEY=... atypica pulse list --json")}`)}`);
  printInfo(`  - ${tip(`Run ${cmd("atypica pulse help")} or ${cmd("atypica auth help")} for detailed command help`)}`);
  printInfo(`  - ${tip(`Docs: ${link("https://atypica.ai/docs/pulse")} · ${link("https://atypica.ai/docs")}`)}`);
}

async function main(): Promise<void> {
  const version = await readVersion();
  const { context, args } = extractGlobalFlags(process.argv.slice(2));
  const [command, ...rest] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    const [maybeSubcommand] = rest;
    if (maybeSubcommand === "auth") {
      printAuthHelp();
      return;
    }
    if (maybeSubcommand === "pulse") {
      printPulseHelp();
      return;
    }
    printHelp();
    return;
  }

  if (command === "--version" || command === "-v" || command === "version") {
    printInfo(version);
    return;
  }

  const config = resolveConfig();
  if (context.updateCheck && config.updateCheck !== false) {
    void maybeNotifyForUpdates(version, config);
  }

  if (command === "auth") {
    await runAuthCommand(rest, context);
    return;
  }

  if (command === "pulse") {
    await runPulseCommand(rest, context);
    return;
  }

  if (command === "self-update") {
    await runSelfUpdateCommand(rest, context);
    return;
  }

  throw new CliError(`Unknown command: ${command}`);
}

main().catch((error) => {
  const { context } = extractGlobalFlags(process.argv.slice(2));
  printError(error, context);
  process.exit(error instanceof CliError ? error.code : 1);
});
