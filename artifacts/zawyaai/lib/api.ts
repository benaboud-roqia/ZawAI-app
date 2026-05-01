const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://zawia-api.onrender.com";

export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}/api${clean}`;
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

export type ScenarioShot = {
  n: number;
  duration: number;
  shotType: string;
  angle: string;
  movement: string;
  description: string;
  transition: string;
};

export type Scenario = {
  title: string;
  hook: string;
  totalDuration: number;
  suggestedLut: string;
  musicMood: string;
  shots: ScenarioShot[];
  tips: string[];
};

export async function generateScenario(input: {
  niche: string;
  topic?: string;
  duration?: number;
  platform?: string;
}): Promise<Scenario> {
  const res = await fetch(apiUrl("/scenarios/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Scenario échoué (${res.status})`);
  return (await res.json()) as Scenario;
}

export type OptimalSlot = { time: string; score: number; reason: string };
export type OptimalPlatform = { id: string; name: string; slots: OptimalSlot[] };

export async function getOptimalTimes(input: {
  platforms: string[];
  timezone?: string;
}): Promise<OptimalPlatform[]> {
  const res = await fetch(apiUrl("/schedule/optimal-times"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Horaires échoués (${res.status})`);
  const data = (await res.json()) as { platforms?: OptimalPlatform[] };
  return data.platforms ?? [];
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
