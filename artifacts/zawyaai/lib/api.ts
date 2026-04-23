const PUBLIC_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (PUBLIC_DOMAIN) {
    return `https://${PUBLIC_DOMAIN}/api${clean}`;
  }
  return `/api${clean}`;
}

export type GeneratedCaption = {
  platform: string;
  caption: string;
  hashtags: string[];
};

export async function generateCaptions(input: {
  platforms: string[];
  topic?: string;
  language?: string;
  tone?: string;
}): Promise<GeneratedCaption[]> {
  const res = await fetch(apiUrl("/captions/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Génération échouée (${res.status}) ${text}`);
  }
  const data = (await res.json()) as { results?: GeneratedCaption[] };
  return data.results ?? [];
}
