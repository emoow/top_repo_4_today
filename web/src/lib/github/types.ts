export type GitHubRepoSearchItem = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  disabled?: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count?: number;
  language: string | null;
  topics?: string[];
  license: { spdx_id?: string; key: string; name: string } | null;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  default_branch: string;
  homepage?: string | null;
  owner: {
    login: string;
    id: number;
    html_url: string;
    type: "User" | "Organization";
  };
};

export type GitHubSearchReposResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepoSearchItem[];
};

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count?: number;
  pushed_at: string | null;
  default_branch: string;
  archived?: boolean;
  fork?: boolean;
  disabled?: boolean;
  license: { spdx_id?: string | null; key: string; name: string } | null;
  owner: { login: string; id: number; html_url: string; type: "User" | "Organization" };
};

export type GitHubRepoTopicsResponse = { names: string[] };

export type GitHubRelease = {
  tag_name: string;
  published_at: string | null;
  name?: string | null;
  body?: string | null;
};

export type GitHubContentFile = {
  type: "file";
  name: string;
  path: string;
  sha: string;
  download_url?: string | null;
};

export type GitHubReadmeResponse = {
  sha: string;
  content?: string;
  encoding?: string;
  download_url?: string | null;
};

export type CrawlSource = "stars" | "forks";

export type DailyPickCandidate = {
  source: CrawlSource;
  rank: number;
  repo: GitHubRepoSearchItem;
};

