import { ErrorResponse, PulseCategoriesResponse, PulseDetailResponse, PulseListResponse } from "../types.js";
import { HttpError } from "./errors.js";
import { parseJson } from "./json.js";

export interface ApiClientOptions {
  apiKey?: string;
  baseUrl: string;
}

function trimSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export class ApiClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor(options: ApiClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = trimSlash(options.baseUrl);
  }

  async getPulseList(params: URLSearchParams): Promise<PulseListResponse> {
    return this.getJson<PulseListResponse>(`/pulse?${params.toString()}`);
  }

  async getPulseCategories(params: URLSearchParams): Promise<PulseCategoriesResponse> {
    const query = params.toString();
    return this.getJson<PulseCategoriesResponse>(`/pulse/categories${query ? `?${query}` : ""}`);
  }

  async getPulse(id: string): Promise<PulseDetailResponse> {
    return this.getJson<PulseDetailResponse>(`/pulse/${id}`);
  }

  async validateApiKey(): Promise<void> {
    const params = new URLSearchParams({ limit: "1" });
    await this.getPulseList(params);
  }

  private async getJson<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers,
    });

    const text = await response.text();
    const fallbackMessage = response.ok
      ? "Invalid JSON response from atypica API"
      : `Request failed with status ${response.status}`;
    const parsed = parseJson<T | ErrorResponse>(text, fallbackMessage);

    if (!response.ok) {
      const message =
        typeof parsed === "object" && parsed && "message" in parsed
          ? String(parsed.message)
          : fallbackMessage;
      throw new HttpError(response.status, message, parsed);
    }

    return parsed as T;
  }
}
