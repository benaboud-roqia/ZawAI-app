import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ScheduledPost = {
  id: string;
  caption: string;
  platforms: string[];
  scheduledFor: number;
  lut: string;
  uri?: string;
  createdAt: number;
};

type ScheduleContextValue = {
  posts: ScheduledPost[];
  loading: boolean;
  add: (post: Omit<ScheduledPost, "id" | "createdAt">) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const STORAGE_KEY = "zawyaai.schedule";

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPosts(JSON.parse(raw));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: ScheduledPost[]) => {
    setPosts(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback<ScheduleContextValue["add"]>(
    async (input) => {
      const item: ScheduledPost = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        ...input,
      };
      await persist([item, ...posts].sort((a, b) => a.scheduledFor - b.scheduledFor));
    },
    [posts, persist],
  );

  const remove = useCallback(
    async (id: string) => {
      await persist(posts.filter((p) => p.id !== id));
    },
    [posts, persist],
  );

  const value = useMemo(
    () => ({ posts, loading, add, remove }),
    [posts, loading, add, remove],
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
