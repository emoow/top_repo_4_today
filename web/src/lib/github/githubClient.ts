import type {
  GitHubContentFile,
  GitHubReadmeResponse,
  GitHubRelease,
  GitHubRepo,
  GitHubRepoTopicsResponse,
  GitHubSearchReposResponse,
} from "@/lib/github/types";

type GitHubClientOptions = {
  token?: string;
  userAgent?: string;
};

type GitHubResponseMeta = {
  status: number;
  remaining?: number;
  resetEpochSeconds?: number;
  retryAfterSeconds?: number;
  requestId?: string;
};

function parseIntHeader(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffMs(attempt: number): number {
  const base = Math.min(250 * 2 ** attempt, 5_000);
  const jitter = Math.floor(Math.random() * 150);
  return base + jitter;
}

export class GitHubClient {
  private readonly token?: string;
  private readonly userAgent: string;

  constructor(opts: GitHubClientOptions = {}) {
    this.token = opts.token;
    this.userAgent = opts.userAgent ?? "top_repo_4_today";
  }

  private buildHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": this.userAgent,
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }

  private readMeta(res: Response): GitHubResponseMeta {
    return {
      status: res.status,
      remaining: parseIntHeader(res.headers.get("x-ratelimit-remaining")),
      resetEpochSeconds: parseIntHeader(res.headers.get("x-ratelimit-reset")),
      retryAfterSeconds: parseIntHeader(res.headers.get("retry-after")),
      requestId: res.headers.get("x-github-request-id") ?? undefined,
    };
  }

  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const maxAttempts = 6;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetch(url, {
        ...init,
        headers: { ...this.buildHeaders(), ...(init?.headers ?? {}) },
      });

      const meta = this.readMeta(res);

      if (res.ok) {
        return (await res.json()) as T;
      }

      // Rate limiting (primary)
      if (res.status === 403 && meta.remaining === 0 && meta.resetEpochSeconds) {
        const waitMs =
          Math.max(meta.resetEpochSeconds * 1000 - Date.now(), 0) + 500;
        await sleep(Math.min(waitMs, 60_000));
        continue;
      }

      // Retry-After (secondary rate limit / abuse detection) or 5xx
      if (
        (res.status === 429 ||
          res.status === 502 ||
          res.status === 503 ||
          res.status === 504) &&
        attempt < maxAttempts - 1
      ) {
        const waitMs = meta.retryAfterSeconds
          ? Math.min(meta.retryAfterSeconds * 1000, 60_000)
          : getBackoffMs(attempt);
        await sleep(waitMs);
        continue;
      }

      let bodyText: string | undefined;
      try {
        bodyText = await res.text();
      } catch {
        bodyText = undefined;
      }
      const suffix = meta.requestId ? ` (request ${meta.requestId})` : "";
      throw new Error(
        `GitHub API error ${res.status}${suffix}: ${bodyText ?? "no body"}`,
      );
    }

    throw new Error("GitHub API error: exceeded retry attempts");
  }

  private async fetchText(url: string, init?: RequestInit): Promise<string> {
    const maxAttempts = 6;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetch(url, {
        ...init,
        headers: { ...this.buildHeaders(), ...(init?.headers ?? {}) },
      });

      const meta = this.readMeta(res);

      if (res.ok) return await res.text();

      if (res.status === 403 && meta.remaining === 0 && meta.resetEpochSeconds) {
        const waitMs =
          Math.max(meta.resetEpochSeconds * 1000 - Date.now(), 0) + 500;
        await sleep(Math.min(waitMs, 60_000));
        continue;
      }

      if (
        (res.status === 429 ||
          res.status === 502 ||
          res.status === 503 ||
          res.status === 504) &&
        attempt < maxAttempts - 1
      ) {
        const waitMs = meta.retryAfterSeconds
          ? Math.min(meta.retryAfterSeconds * 1000, 60_000)
          : getBackoffMs(attempt);
        await sleep(waitMs);
        continue;
      }

      const suffix = meta.requestId ? ` (request ${meta.requestId})` : "";
      throw new Error(`GitHub API error ${res.status}${suffix}: text fetch failed`);
    }

    throw new Error("GitHub API error: exceeded retry attempts");
  }

  async searchRepositories(params: {
    q: string;
    sort: "stars" | "forks" | "updated";
    order?: "desc" | "asc";
    perPage?: number;
    page?: number;
  }): Promise<GitHubSearchReposResponse> {
    const perPage = params.perPage ?? 30;
    const page = params.page ?? 1;
    const order = params.order ?? "desc";
    const url = new URL("https://api.github.com/search/repositories");
    url.searchParams.set("q", params.q);
    url.searchParams.set("sort", params.sort);
    url.searchParams.set("order", order);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    return await this.fetchJson<GitHubSearchReposResponse>(url.toString());
  }

  async getRepo(params: { owner: string; repo: string }): Promise<GitHubRepo> {
    const url = `https://api.github.com/repos/${params.owner}/${params.repo}`;
    return await this.fetchJson<GitHubRepo>(url);
  }

  async getRepoTopics(params: {
    owner: string;
    repo: string;
  }): Promise<GitHubRepoTopicsResponse> {
    const url = `https://api.github.com/repos/${params.owner}/${params.repo}/topics`;
    return await this.fetchJson<GitHubRepoTopicsResponse>(url);
  }

  async getRepoLanguages(params: {
    owner: string;
    repo: string;
  }): Promise<Record<string, number>> {
    const url = `https://api.github.com/repos/${params.owner}/${params.repo}/languages`;
    return await this.fetchJson<Record<string, number>>(url);
  }

  async getLatestRelease(params: {
    owner: string;
    repo: string;
  }): Promise<GitHubRelease> {
    const url = `https://api.github.com/repos/${params.owner}/${params.repo}/releases/latest`;
    return await this.fetchJson<GitHubRelease>(url);
  }

  async listReleases(params: {
    owner: string;
    repo: string;
    perPage?: number;
    page?: number;
  }): Promise<GitHubRelease[]> {
    const perPage = params.perPage ?? 30;
    const page = params.page ?? 1;
    const url = new URL(`https://api.github.com/repos/${params.owner}/${params.repo}/releases`);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    return await this.fetchJson<GitHubRelease[]>(url.toString());
  }

  async getReadme(params: {
    owner: string;
    repo: string;
  }): Promise<GitHubReadmeResponse> {
    const url = `https://api.github.com/repos/${params.owner}/${params.repo}/readme`;
    return await this.fetchJson<GitHubReadmeResponse>(url);
  }

  async getContents(params: {
    owner: string;
    repo: string;
    path: string;
  }): Promise<GitHubContentFile | unknown> {
    const url = `https://api.github.com/repos/${params.owner}/${params.repo}/contents/${params.path}`;
    return await this.fetchJson<GitHubContentFile | unknown>(url);
  }

  async downloadText(url: string): Promise<string> {
    return await this.fetchText(url, {});
  }
}

