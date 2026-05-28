import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

export const runtime = "edge";

type ChatMessage = { role: "user" | "assistant"; content: string };
type AIConfigRow = {
  api_key: string;
  model: string;
  platform_context: string;
};

function toGeminiRole(role: ChatMessage["role"]) {
  return role === "assistant" ? "model" : "user";
}

function extractGeminiText(payload: unknown) {
  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    .candidates;
  return (
    candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? ""
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [...req.cookies.getAll()];
          },
          setAll() {},
        },
      }
    );

    const { data: config } = await supabase
      .from("ai_config")
      .select("api_key, model, platform_context")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const aiConfig = config as AIConfigRow | null;
    const apiKey = aiConfig?.api_key?.trim() ?? "";
    const savedModel = aiConfig?.model?.trim() || "";
    const model = savedModel.startsWith("gpt-") ? "gemini-2.5-flash" : savedModel || "gemini-2.5-flash";
    const systemPrompt = aiConfig?.platform_context?.trim() ?? "";

    if (!apiKey || apiKey.includes("\u2022\u2022") || apiKey.startsWith("sk-demo")) {
      return Response.json(
        {
          error:
            "Gemini API kalit sozlanmagan. Admin paneldagi AI Settings bo'limiga Google AI Studio API key kiriting.",
        },
        { status: 400 }
      );
    }

    const conversation = messages.filter((message) => message.content.trim());
    while (conversation[0]?.role === "assistant") {
      conversation.shift();
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: systemPrompt
            ? {
                parts: [{ text: systemPrompt }],
              }
            : undefined,
          contents: conversation.map((message) => ({
              role: toGeminiRole(message.role),
              parts: [{ text: message.content }],
            })),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string } })?.error?.message ||
        `Gemini API xatosi: ${geminiResponse.status}`;

      return Response.json({ error: errorMessage }, { status: geminiResponse.status });
    }

    const data = await geminiResponse.json();
    const content = extractGeminiText(data);

    if (!content) {
      return Response.json(
        { error: "Gemini bo'sh javob qaytardi. Model yoki promptni tekshiring." },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json({ error: "Server xatosi yuz berdi" }, { status: 500 });
  }
}
