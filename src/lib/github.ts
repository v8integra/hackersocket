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

export async function fetchTopRepos(username: string, limit = 6): Promise<GithubRepo[]> {
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
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
    }));
}
