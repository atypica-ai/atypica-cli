import { inspect } from "node:util";
import { CliContext } from "../types.js";

function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

const ANSI = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  cyan: "\u001b[36m",
  brightCyan: "\u001b[96m",
  yellow: "\u001b[33m",
  brightYellow: "\u001b[93m",
  green: "\u001b[32m",
  brightGreen: "\u001b[92m",
  magenta: "\u001b[35m",
  brightMagenta: "\u001b[95m",
  red: "\u001b[31m",
  brightRed: "\u001b[91m",
  blue: "\u001b[34m",
  brightBlue: "\u001b[94m",
  underline: "\u001b[4m",
} as const;

function supportsColor(): boolean {
  if (process.env.NO_COLOR === "1") return false;
  if (process.env.FORCE_COLOR === "1" || process.env.CLICOLOR_FORCE === "1") return true;
  return process.stdout.isTTY === true;
}

function paint(text: string, style: string): string {
  if (!supportsColor()) return text;
  return `${style}${text}${ANSI.reset}`;
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

export function printJson(value: unknown): void {
  process.stdout.write(`${stringify(value)}\n`);
}

export function printInfo(message: string): void {
  process.stdout.write(`${message}\n`);
}

export function printWarning(message: string): void {
  process.stderr.write(`${highlightWarning("Warning")}: ${message}\n`);
}

export function printError(error: unknown, context?: CliContext): void {
  if (context?.json) {
    const message = error instanceof Error ? error.message : String(error);
    printJson({ success: false, message });
    return;
  }

  if (error instanceof Error) {
    process.stderr.write(`${highlightError(error.message)}\n`);
    return;
  }

  process.stderr.write(`${highlightError(inspect(error))}\n`);
}

export function formatValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return String(value);
}

export function printTable(headers: string[], rows: string[][]): void {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => stripAnsi(row[index] ?? "").length)),
  );

  const renderRow = (row: string[]) =>
    row
      .map((cell, index) => {
        const rawCell = cell ?? "";
        const visibleLength = stripAnsi(rawCell).length;
        return `${rawCell}${" ".repeat(Math.max(0, widths[index] - visibleLength))}`;
      })
      .join("  ");

  printInfo(paint(renderRow(headers), `${ANSI.bold}${ANSI.brightCyan}`));
  printInfo(paint(widths.map((width) => "-".repeat(width)).join("  "), `${ANSI.dim}${ANSI.brightBlue}`));

  for (const row of rows) {
    printInfo(renderRow(row));
  }
}

export function highlightTitle(text: string): string {
  return paint(text, `${ANSI.bold}${ANSI.brightCyan}`);
}

export function highlightCategory(text: string): string {
  return paint(text, `${ANSI.bold}${ANSI.brightMagenta}`);
}

export function highlightDate(text: string): string {
  return paint(text, `${ANSI.brightBlue}`);
}

export function highlightHeat(text: string): string {
  return paint(text, `${ANSI.bold}${ANSI.brightYellow}`);
}

export function highlightDelta(text: string, isPositive: boolean | null): string {
  if (isPositive === null) return paint(text, `${ANSI.dim}${ANSI.blue}`);
  return paint(text, isPositive ? `${ANSI.bold}${ANSI.brightGreen}` : `${ANSI.bold}${ANSI.brightRed}`);
}

export function highlightLink(text: string): string {
  return paint(text, `${ANSI.underline}${ANSI.cyan}`);
}

export function highlightMuted(text: string): string {
  return paint(text, `${ANSI.dim}${ANSI.blue}`);
}

export function highlightLabel(text: string): string {
  return paint(text, `${ANSI.bold}${ANSI.brightBlue}`);
}

export function highlightSection(text: string): string {
  return paint(text, `${ANSI.bold}${ANSI.brightMagenta}`);
}

export function highlightIndex(text: string): string {
  return paint(text, `${ANSI.dim}${ANSI.cyan}`);
}

export function highlightWarning(text: string): string {
  return paint(text, `${ANSI.bold}${ANSI.yellow}`);
}

export function highlightError(text: string): string {
  return paint(text, `${ANSI.bold}${ANSI.red}`);
}
