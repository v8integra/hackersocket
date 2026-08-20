export type GithubRepo = {
  name: string;
  url: string;
  description: string | null;
  stars: number;
  language: string | null;
};

type GithubApiRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
};

export async function fetchAllRepos(username: string): Promise<GithubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`,
    {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) return [];

  const repos = (await res.json()) as GithubApiRepo[];

  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
    }));
}

export async function fetchTopRepos(username: string, limit = 6): Promise<GithubRepo[]> {
  const all = await fetchAllRepos(username);
  return all.slice(0, limit);
}

const MAX_SHOWCASE_REPOS = 6;

export function pickShowcaseRepos(allRepos: GithubRepo[], showcasedNames: string[]): GithubRepo[] {
  if (showcasedNames.length === 0) {
    return allRepos.slice(0, MAX_SHOWCASE_REPOS);
  }

  const byName = new Map(allRepos.map((repo) => [repo.name, repo]));
  return showcasedNames
    .map((name) => byName.get(name))
    .filter((repo): repo is GithubRepo => Boolean(repo));
}
