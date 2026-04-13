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
import { printError, printInfo } from "./lib/output.js";
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
  printInfo("atypica CLI");
  printInfo("");
  printInfo("Usage:");
  printInfo("  atypica <command> <subcommand> [options]");
  printInfo("");
  printInfo("Core commands:");
  printInfo("  auth         Configure and inspect Personal API Key access");
  printInfo("  pulse        Query Pulse categories, lists, and details");
  printInfo("  self-update  Print or run the recommended upgrade command");
  printInfo("  help         Show global or command-specific help");
  printInfo("");
  printInfo("Global flags:");
  printInfo("  --json             Output machine-readable JSON when supported");
  printInfo("  --no-update-check  Disable the background version check for this run");
  printInfo("");
  printInfo("Examples:");
  printInfo("  atypica auth login");
  printInfo("  atypica pulse list --limit 5 --locale en-US");
  printInfo("  atypica pulse get 3396 --json --no-update-check");
  printInfo("");
  printInfo("Agent tips:");
  printInfo("  - Use `--json` for downstream parsing");
  printInfo("  - Prefer env-based auth in automation: `ATYPICA_API_KEY=... atypica pulse list --json`");
  printInfo("  - Run `atypica pulse help` or `atypica auth help` for detailed command help");
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
