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

export type CrawlSource = "stars" | "forks";

export type DailyPickCandidate = {
  source: CrawlSource;
  rank: number;
  repo: GitHubRepoSearchItem;
};

