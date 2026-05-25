import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      apiKey,
      model = "gpt-4o-mini",
      systemPrompt = "",
    } = body as {
      messages: { role: string; content: string }[];
      apiKey: string;
      model?: string;
      systemPrompt?: string;
    };

    if (!apiKey || apiKey.includes("••") || apiKey.startsWith("sk-demo")) {
      return new Response(
        JSON.stringify({
          error:
            "API kalit sozlanmagan. Admin paneldan AI Settings bo'limida haqiqiy API kalitni kiriting.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // System message ni birinchi qo'shamiz
    const fullMessages = [
      ...(systemPrompt
        ? [{ role: "system" as const, content: systemPrompt }]
        : []),
      ...messages,
    ];

    // OpenAI API ga so'rov — streaming
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string } })?.error?.message ||
        `OpenAI API xatosi: ${response.status}`;

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream ni client ga uzatamiz
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line === "data: [DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }
              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // skip malformed JSON
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
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
    return new Response(
      JSON.stringify({ error: "Server xatosi yuz berdi" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
