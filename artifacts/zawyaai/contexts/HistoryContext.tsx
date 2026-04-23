import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type HistoryItem = {
  id: string;
  uri?: string;
  lut: string;
  platforms: string[];
  caption: string;
  hashtags: string[];
  score: number;
  views: number;
  likes: number;
  shares: number;
  status: "publié" | "programmé" | "brouillon";
  createdAt: number;
};

type HistoryContextValue = {
  items: HistoryItem[];
  loading: boolean;
  add: (item: Omit<HistoryItem, "id" | "createdAt" | "score" | "views" | "likes" | "shares" | "status">) => Promise<HistoryItem>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

const STORAGE_KEY = "zawyaai.history";

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw) as HistoryItem[]);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: HistoryItem[]) => {
    setItems(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback<HistoryContextValue["add"]>(
    async (input) => {
      const score = 70 + Math.floor(Math.random() * 25);
      const views = 1200 + Math.floor(Math.random() * 18000);
      const likes = Math.floor(views * (0.04 + Math.random() * 0.08));
      const shares = Math.floor(likes * (0.05 + Math.random() * 0.15));
      const item: HistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        score,
        views,
        likes,
        shares,
        status: "publié",
        ...input,
      };
      const next = [item, ...items];
      await persist(next);
      return item;
    },
    [items, persist],
  );

  const remove = useCallback(
    async (id: string) => {
      await persist(items.filter((i) => i.id !== id));
    },
    [items, persist],
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const value = useMemo(
    () => ({ items, loading, add, remove, clear }),
    [items, loading, add, remove, clear],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
