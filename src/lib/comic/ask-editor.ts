import { createServerFn } from "@tanstack/react-start";

export type EditorOut = {
  ok: true;
  strengths: string[];
  question: string;
  next: string;
} | { ok: false; error: string };

export const askEditor = createServerFn({ method: "POST" })
  .validator((input: { snapshot: string; lesson: string }) => input)
  .handler(async ({ data }): Promise<EditorOut> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Editor is offline right now." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 320,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a graphic-novel editor coaching grades 6-8. Be direct, kind, specific. Never write their comic for them. Reply JSON only: {\"strengths\":[\"...\",\"...\"],\"question\":\"...\",\"next\":\"...\"}. strengths: two things the page already does. question: one craft question. next: one concrete next move.",
          },
          {
            role: "user",
            content: `Mission lesson: ${data.lesson}\nPage:\n${data.snapshot}`,
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: "Editor could not read the page." };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const text = body.choices[0]?.message.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ok: false, error: "Editor mumbled. Try Check again." };
    try {
      const parsed = JSON.parse(match[0]) as {
        strengths?: string[];
        question?: string;
        next?: string;
      };
      return {
        ok: true,
        strengths: (parsed.strengths ?? []).slice(0, 3),
        question: parsed.question ?? "What does the last panel make the reader want to know?",
        next: parsed.next ?? "Change the camera on one panel.",
      };
    } catch {
      return { ok: false, error: "Editor mumbled. Try Check again." };
    }
  });
