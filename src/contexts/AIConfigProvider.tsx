"use client";

import { defaultAIConfig, type AdminAIConfig } from "@/lib/data/admin-ai-config";
import { createClient } from "@/lib/supabase/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AIConfigRow = {
  api_key: string;
  model: string;
  platform_context: string;
  updated_at: string;
};

interface AIConfigContextValue {
  config: AdminAIConfig;
  updateConfig: (patch: Partial<AdminAIConfig>) => void;
  refreshConfig: () => Promise<void>;
  isConfigured: boolean;
}

const AIConfigContext = createContext<AIConfigContextValue>({
  config: defaultAIConfig,
  updateConfig: () => {},
  refreshConfig: async () => {},
  isConfigured: false,
});

export function AIConfigProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [config, setConfig] = useState<AdminAIConfig>(defaultAIConfig);

  const refreshConfig = useCallback(async () => {
    const { data } = await supabase
      .from("ai_config")
      .select("api_key, model, platform_context, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const row = data as AIConfigRow | null;
    if (!row) {
      setConfig(defaultAIConfig);
      return;
    }

    const savedModel = row.model || defaultAIConfig.model;
    setConfig({
      apiKey: row.api_key ?? "",
      model: savedModel.startsWith("gpt-") ? defaultAIConfig.model : savedModel,
      platformContext: row.platform_context || defaultAIConfig.platformContext,
      updatedAt: row.updated_at?.slice(0, 10) || defaultAIConfig.updatedAt,
    });
  }, [supabase]);

  useEffect(() => {
    void refreshConfig();

    const channel = supabase
      .channel("ai-config-provider")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ai_config" },
        () => {
          void refreshConfig();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshConfig, supabase]);

  const updateConfig = useCallback((patch: Partial<AdminAIConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString().slice(0, 10),
    }));
  }, []);

  const isConfigured =
    config.apiKey.trim().length > 10 &&
    !config.apiKey.includes("\u2022\u2022") &&
    !config.apiKey.startsWith("sk-demo");

  return (
    <AIConfigContext.Provider value={{ config, updateConfig, refreshConfig, isConfigured }}>
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig() {
  return useContext(AIConfigContext);
}
