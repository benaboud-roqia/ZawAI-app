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

export type AiTip = {
  title: string;
  body: string;
  icon: string;
  category: string;
};

export async function generateTips(context: {
  recentLuts?: string[];
  recentPlatforms?: string[];
  avgScore?: number;
  publishedCount?: number;
}): Promise<AiTip[]> {
  const res = await fetch(apiUrl("/tips/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });
  if (!res.ok) throw new Error(`Tips échoués (${res.status})`);
  const data = (await res.json()) as { tips?: AiTip[] };
  return data.tips ?? [];
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function chatSupport(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(apiUrl("/support/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Chat échoué (${res.status}) ${text}`);
  }
  const data = (await res.json()) as { reply?: string };
  return data.reply ?? "";
}

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
