export interface CliContext {
  json: boolean;
  updateCheck: boolean;
}

export interface CliConfig {
  apiKey?: string;
  baseUrl?: string;
  updateCheck?: boolean;
  lastUpdateCheckAt?: string;
  skippedVersion?: string;
}

export interface PulseListItem {
  id: number;
  title: string;
  content: string;
  category: string;
  locale: "en-US";
  heatScore: number | null;
  heatDelta: number | null;
  createdAt: string;
}

export interface PulseDetail extends PulseListItem {
  posts: Array<Record<string, unknown>>;
}

export interface PulsePagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PulseListResponse {
  success: boolean;
  data: PulseListItem[];
  pagination: PulsePagination;
}

export interface PulseCategoriesResponse {
  success: boolean;
  data: string[];
}

export interface PulseDetailResponse {
  success: boolean;
  data: PulseDetail;
}

export interface ErrorResponse {
  success: false;
  message: string;
}

export interface PackageManagerInfo {
  name: "npm" | "pnpm" | "yarn" | "bun" | "unknown";
  installCommand: string;
  runCommand?: string[];
}
