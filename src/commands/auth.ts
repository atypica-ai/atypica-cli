import { API_KEY_URL, DOCS_URL } from "../lib/constants.js";
import { loadConfig, resolveConfig, saveConfig } from "../lib/config.js";
import { promptForApiKey } from "../lib/auth.js";
import { printInfo, printJson } from "../lib/output.js";
import { CliContext } from "../types.js";

export function printAuthHelp(): void {
  printInfo("Usage:");
  printInfo("  atypica auth login");
  printInfo("  atypica auth status");
  printInfo("  atypica auth logout");
  printInfo("");
  printInfo("Commands:");
  printInfo("  login   Start interactive API key setup and validate the key");
  printInfo("  status  Show whether auth is configured and where it comes from");
  printInfo("  logout  Remove the saved local API key");
  printInfo("");
  printInfo("Notes:");
  printInfo("  - `ATYPICA_API_KEY` overrides the saved local config");
  printInfo(`  - Generate keys at ${API_KEY_URL}`);
  printInfo(`  - API docs: ${DOCS_URL}`);
}

export async function runAuthCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand] = args;

  if (!subcommand || subcommand === "help" || subcommand === "--help" || subcommand === "-h") {
    printAuthHelp();
    return;
  }

  if (subcommand === "login") {
    const config = resolveConfig();
    const apiKey = await promptForApiKey(config);
    saveConfig({
      ...loadConfig(),
      apiKey,
    });

    if (context.json) {
      printJson({ success: true, configured: true });
      return;
    }

    printInfo("API key saved.");
    printInfo(`Manage keys: ${API_KEY_URL}`);
    return;
  }

  if (subcommand === "status") {
    const config = resolveConfig();
    const configured = Boolean(config.apiKey);
    const payload = {
      configured,
      source: process.env.ATYPICA_API_KEY ? "env" : configured ? "config" : "none",
      baseUrl: config.baseUrl,
      docsUrl: DOCS_URL,
      apiKeyUrl: API_KEY_URL,
    };

    if (context.json) {
      printJson(payload);
      return;
    }

    printInfo(`Configured: ${configured ? "yes" : "no"}`);
    printInfo(`Source: ${payload.source}`);
    printInfo(`Base URL: ${payload.baseUrl}`);
    return;
  }

  if (subcommand === "logout") {
    const fileConfig = loadConfig();
    saveConfig({
      ...fileConfig,
      apiKey: undefined,
    });

    if (context.json) {
      printJson({ success: true, configured: false });
      return;
    }

    printInfo("Saved API key removed from local config.");
    return;
  }

  printAuthHelp();
}
