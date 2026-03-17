export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildPostSlug(params: { fullName: string; dayISO: string }): string {
  return `${slugify(params.fullName)}-${params.dayISO}`;
}

