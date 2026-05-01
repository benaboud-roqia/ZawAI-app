import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginWithTikTok, type TikTokUser } from "@/lib/tiktokAuth";

type User = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "studio";
  platform?: string;
  avatar?: string;
  provider?: "email" | "tiktok" | "google";
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithTikTok: () => Promise<void>;
  signOut: () => Promise<void>;
  setPlan: (plan: User["plan"]) => Promise<void>;
  setPlatform: (platform: string) => Promise<void>;
};

const STORAGE_KEY = "zawyaai.user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw) as User);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: User | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, _password: string) => {
      const next: User = {
        id: Date.now().toString(),
        name: email.split("@")[0] ?? "Créateur",
        email,
        plan: "free",
      };
      await persist(next);
    },
    [persist],
  );

  const signUp = useCallback(
    async (name: string, email: string, _password: string) => {
      const next: User = {
        id: Date.now().toString(),
        name,
        email,
        plan: "free",
      };
      await persist(next);
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    await persist(null);
  }, [persist]);

  const signInWithTikTok = useCallback(async () => {
    const tikTokUser: TikTokUser | null = await loginWithTikTok();
    if (!tikTokUser) return; // annulé par l'utilisateur
    const next: User = {
      id: tikTokUser.open_id,
      name: tikTokUser.display_name,
      email: `${tikTokUser.open_id}@tiktok.zawyaai`,
      plan: "free",
      avatar: tikTokUser.avatar_url,
      provider: "tiktok",
    };
    await persist(next);
  }, [persist]);

  const setPlan = useCallback(
    async (plan: User["plan"]) => {
      if (!user) return;
      await persist({ ...user, plan });
    },
    [user, persist],
  );

  const setPlatform = useCallback(
    async (platform: string) => {
      if (!user) return;
      await persist({ ...user, platform });
    },
    [user, persist],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUp, signInWithTikTok, signOut, setPlan, setPlatform }),
    [user, loading, signIn, signUp, signInWithTikTok, signOut, setPlan, setPlatform],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
