"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { defaultAIConfig } from "@/lib/data/admin-ai-config";
import { Bot, Eye, EyeOff, Key, Save } from "lucide-react";
import { useState } from "react";

export default function AdminAISettingsPage() {
  const [apiKey, setApiKey] = useState(defaultAIConfig.apiKey);
  const [model, setModel] = useState(defaultAIConfig.model);
  const [context, setContext] = useState(defaultAIConfig.platformContext);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
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
        Oxirgi yangilanish: {defaultAIConfig.updatedAt}. Productionda API kalitini server
        environment variable orqali saqlang.
      </p>
    </div>
  );
}
