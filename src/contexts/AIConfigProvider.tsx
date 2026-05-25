"use client";

import { defaultAIConfig, type AdminAIConfig } from "@/lib/data/admin-ai-config";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AIConfigContextValue {
  config: AdminAIConfig;
  updateConfig: (patch: Partial<AdminAIConfig>) => void;
  isConfigured: boolean;
}

const STORAGE_KEY = "tricore-ai-config";

const AIConfigContext = createContext<AIConfigContextValue>({
  config: defaultAIConfig,
  updateConfig: () => {},
  isConfigured: false,
});

export function AIConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AdminAIConfig>(defaultAIConfig);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AdminAIConfig>;
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  const updateConfig = useCallback(
    (patch: Partial<AdminAIConfig>) => {
      setConfig((prev) => {
        const next = {
          ...prev,
          ...patch,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const isConfigured =
    mounted &&
    config.apiKey.length > 10 &&
    !config.apiKey.includes("••") &&
    !config.apiKey.startsWith("sk-demo");

  return (
    <AIConfigContext.Provider value={{ config, updateConfig, isConfigured }}>
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig() {
  return useContext(AIConfigContext);
}
