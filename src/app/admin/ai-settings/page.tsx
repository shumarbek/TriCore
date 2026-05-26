"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { useAIConfig } from "@/contexts/AIConfigProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Bot, CheckCircle, Eye, EyeOff, Key, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminAISettingsPage() {
  const { config, updateConfig, isConfigured } = useAIConfig();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [context, setContext] = useState(config.platformContext);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // config o'zgarganda sync
  useEffect(() => {
    setApiKey(config.apiKey);
    setModel(config.model);
    setContext(config.platformContext);
  }, [config.apiKey, config.model, config.platformContext]);

  // Supabase dan config olish
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("ai_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setApiKey(data.api_key);
        setModel(data.model);
        setContext(data.platform_context);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    // localStorage ga saqlash (fallback)
    updateConfig({
      apiKey: apiKey.trim(),
      model: model.trim() || "gpt-4o-mini",
      platformContext: context,
    });

    // Supabase ga saqlash
    if (user) {
      const supabase = createClient();
      const payload = {
        api_key: apiKey.trim(),
        model: model.trim() || "gpt-4o-mini",
        platform_context: context,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      };
      // Upsert: birinchi qator mavjud bo'lsa yangilash, aks holda yaratish
      const { data: existing } = await supabase
        .from("ai_config")
        .select("id")
        .limit(1)
        .single();
      if (existing) {
        await supabase.from("ai_config").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("ai_config").insert(payload);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl">
            <PageHeader
        title="AI Settings"
        description="OpenAI API kaliti va platforma context — AI userlarga platforma bo'yicha javob beradi"
      />

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <>
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium text-success">AI sozlangan va tayyor</p>
                <p className="text-xs text-text-muted">Model: {config.model} | Foydalanuvchilar AI Assistant dan foydalana oladi</p>
              </div>
              <Badge variant="success" className="ml-auto">Active</Badge>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-warning">AI sozlanmagan</p>
                <p className="text-xs text-text-muted">Haqiqiy OpenAI API kalitni kiriting — foydalanuvchilar AI Assistant ishlatishi uchun</p>
              </div>
              <Badge variant="warning" className="ml-auto">Inactive</Badge>
            </>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-primary" />
          API Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-muted mb-1.5 block">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 font-mono"
              />
              <Button variant="ghost" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Input
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4o-mini"
          />
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-accent" />
          Platform Context
        </h3>
        <p className="text-sm text-text-muted mb-3">
          AI shu matndan foydalanib foydalanuvchilarga TriCore haqida savollarga javob beradi
          (fanlar, roadmap, imtihonlar, homework qoidalari va hokazo).
        </p>
        <Textarea
          className="min-h-[280px] font-mono text-sm"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </Card>

      <Button variant="primary" size="lg" onClick={handleSave}>
        <Save className="w-4 h-4" />
        {saved ? "Saqlandi!" : "Sozlamalarni saqlash"}
      </Button>

            <p className="text-xs text-text-muted mt-4">
        Oxirgi yangilanish: {config.updatedAt}. API kalit localStorage da saqlanadi.
        Productionda API kalitini server environment variable orqali saqlang.
      </p>
    </div>
  );
}
