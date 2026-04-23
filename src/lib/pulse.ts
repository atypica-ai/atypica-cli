import { PulseDetail, PulseListItem, PulseListResponse } from "../types.js";
import {
  formatValue,
  highlightCategory,
  highlightDate,
  highlightDelta,
  highlightHeat,
  highlightIndex,
  highlightLabel,
  highlightLink,
  highlightMuted,
  highlightSection,
  highlightTitle,
  printInfo,
  printJson,
  printTable,
} from "./output.js";

const SUMMARY_LIMIT = 96;

export interface RenderPulseListOptions {
  json: boolean;
  sourceUrlsById?: Map<number, string | null>;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toISOString().slice(0, 10);
}

function formatHeat(value: number | null): string {
  if (value === null) return "-";
  return value.toFixed(2);
}

function formatDelta(value: number | null): { text: string; positive: boolean | null } {
  if (value === null) return { text: "-", positive: null };
  const positive = value >= 0;
  const sign = positive ? "+" : "";
  return { text: `${sign}${value.toFixed(2)}`, positive };
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function sortByShorterLength(urls: string[]): string[] {
  return [...urls].sort((left, right) => left.length - right.length);
}

export function extractTwitterSourceUrls(posts: Array<Record<string, unknown>>): string[] {
  const urlRegex = /https?:\/\/(?:x|twitter)\.com\/[^\s"')\]}]+/gi;
  const discovered = new Set<string>();

  for (const post of posts) {
    const payload = JSON.stringify(post);
    const matches = payload.match(urlRegex);
    if (!matches) continue;
    for (const rawUrl of matches) {
      discovered.add(normalizeUrl(rawUrl));
    }
  }

  return sortByShorterLength([...discovered]);
}

function formatSourceValue(itemId: number, sourceUrlsById?: Map<number, string | null>): string {
  if (!sourceUrlsById) return "-";
  const source = sourceUrlsById.get(itemId) ?? null;
  if (!source) return "-";
  return source.length > 42 ? `${source.slice(0, 39)}…` : source;
}

function sortHistoryByDate(history: NonNullable<PulseDetail["history"]>): NonNullable<PulseDetail["history"]> {
  return [...history].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
}

function formatSentiment(value: NonNullable<NonNullable<PulseDetail["opinionSummary"]>["overallSentiment"]>): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

export function renderPulseList(response: PulseListResponse, options: RenderPulseListOptions): void {
  if (options.json) {
    printJson(response);
    return;
  }

  const items = response.data;
  if (items.length === 0) {
    printInfo("No pulses found.");
    return;
  }

  printTable(
    ["ID", "Category", "Locale", "Date", "Heat", "Delta", "Source", "Title", "Summary"],
    items.map((item) => {
      const delta = formatDelta(item.heatDelta);
      return [
        String(item.id),
        highlightCategory(item.category),
        item.locale,
        highlightDate(formatDate(item.createdAt)),
        highlightHeat(formatHeat(item.heatScore)),
        highlightDelta(delta.text, delta.positive),
        highlightLink(formatSourceValue(item.id, options.sourceUrlsById)),
        highlightTitle(truncateText(item.title, 52)),
        truncateText(item.content.replace(/\s+/g, " ").trim(), SUMMARY_LIMIT),
      ];
    }),
  );

  const totalPages = Math.max(1, Math.ceil(response.pagination.total / response.pagination.pageSize));
  const hasPrev = response.pagination.page > 1;
  const hasNext = response.pagination.page < totalPages;
  const paginationSummary = [
    `Page ${response.pagination.page}/${totalPages}`,
    `Total ${response.pagination.total}`,
    `PageSize ${response.pagination.pageSize}`,
    `Prev ${hasPrev ? "yes" : "no"}`,
    `Next ${hasNext ? "yes" : "no"}`,
  ].join("  ·  ");
  printInfo("");
  printInfo(highlightMuted(paginationSummary));
  if (hasNext) {
    printInfo(highlightMuted(`Tip: atypica pulse list --page ${response.pagination.page + 1} --limit ${response.pagination.pageSize}`));
  }
}

export function renderPulseCategories(items: string[], json: boolean): void {
  if (json) {
    printJson(items);
    return;
  }

  if (items.length === 0) {
    printInfo(highlightMuted("No categories found."));
    return;
  }

  for (const item of items) {
    printInfo(highlightCategory(item));
  }
}

export function renderPulseDetail(item: PulseDetail, json: boolean): void {
  if (json) {
    printJson(item);
    return;
  }

  printInfo(`${highlightLabel("ID:")} ${item.id}`);
  printInfo(`${highlightLabel("Title:")} ${highlightTitle(item.title)}`);
  printInfo(`${highlightLabel("Category:")} ${highlightCategory(item.category)}`);
  printInfo(`${highlightLabel("Locale:")} ${highlightMuted(item.locale)}`);
  printInfo(`${highlightLabel("Heat Score:")} ${highlightHeat(formatValue(item.heatScore))}`);
  const delta = formatDelta(item.heatDelta);
  printInfo(`${highlightLabel("Heat Delta:")} ${highlightDelta(delta.text, delta.positive)}`);
  printInfo(`${highlightLabel("Created At:")} ${highlightDate(item.createdAt)}`);
  printInfo("");
  printInfo(highlightSection("Content:"));
  printInfo(item.content.trim());

  if (item.opinionSummary) {
    printInfo("");
    printInfo(highlightSection("Opinion:"));
    printInfo(item.opinionSummary.summary.trim());

    if (item.opinionSummary.overallSentiment) {
      printInfo(
        `${highlightLabel("Overall Sentiment:")} ${highlightMuted(formatSentiment(item.opinionSummary.overallSentiment))}`,
      );
    }

    if (item.opinionSummary.keyViewpoints && item.opinionSummary.keyViewpoints.length > 0) {
      printInfo("");
      printInfo(highlightSection(`Key Viewpoints (${item.opinionSummary.keyViewpoints.length}):`));
      item.opinionSummary.keyViewpoints.forEach((viewpoint, index) => {
        printInfo(
          `${highlightIndex(`${index + 1}.`)} ${highlightLabel(`${viewpoint.stance}:`)} ${viewpoint.summary}`,
        );
      });
    }

    if (item.opinionSummary.controversies && item.opinionSummary.controversies.length > 0) {
      printInfo("");
      printInfo(highlightSection(`Controversies (${item.opinionSummary.controversies.length}):`));
      item.opinionSummary.controversies.forEach((controversy, index) => {
        printInfo(`${highlightIndex(`${index + 1}.`)} ${controversy}`);
      });
    }
  }

  if (item.history && item.history.length > 0) {
    printInfo("");
    printInfo(highlightSection(`Heat Trend (${item.history.length}):`));
    sortHistoryByDate(item.history).forEach((point, index) => {
      printInfo(`${highlightIndex(`${index + 1}.`)} ${highlightDate(point.date)}  ${highlightHeat(point.heatScore.toFixed(2))}`);
    });
  }

  const sourceUrls = extractTwitterSourceUrls(item.posts);
  if (sourceUrls.length > 0) {
    printInfo("");
    printInfo(highlightSection(`Source URLs (${sourceUrls.length}):`));
    sourceUrls.forEach((url, index) => {
      printInfo(`${highlightIndex(`${index + 1}.`)} ${highlightLink(url)}`);
    });
  }

  if (item.posts.length > 0) {
    printInfo("");
    printInfo(highlightSection(`Posts (${item.posts.length}):`));

    item.posts.forEach((post, index) => {
      const content = typeof post.content === "string" ? post.content : JSON.stringify(post);
      printInfo(`${highlightIndex(`${index + 1}.`)} ${content}`);
    });
  }
}
