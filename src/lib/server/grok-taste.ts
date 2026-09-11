import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  likes: z.array(z.string()).max(24),
  passes: z.array(z.string()).max(24),
  candidates: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        year: z.number(),
        genres: z.array(z.string()),
        director: z.string(),
      }),
    )
    .max(24),
  who: z.string().nullable().optional(),
  mood: z.string().nullable().optional(),
  genre: z.string().nullable().optional(),
  minutesLeft: z.number().optional(),
});

export type GrokTasteResult =
  | { ok: true; ids: string[]; note: string }
  | { ok: false; error: string };

export const grokRerank = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<GrokTasteResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "AI is not available" };
    const ids = new Set(data.candidates.map((c) => c.id));
    const sitting = [data.who, data.mood, data.genre].filter(Boolean).join(" · ") || "open night";
    const clock = data.minutesLeft ? `${Math.round(data.minutesLeft)} minutes before bedtime` : "";
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 420,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You rank films this one person would actually watch tonight. Return JSON {\"ids\": string[], \"note\": string}. ids must be a permutation of the candidate ids, best first. note is one short sentence that cites a like or a pass — never a generic blurb. Prefer films that fit the remaining minutes.",
          },
          {
            role: "user",
            content: JSON.stringify({
              sitting,
              clock,
              likes: data.likes,
              passes: data.passes,
              candidates: data.candidates,
            }),
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content ?? "";
    let parsed: { ids?: unknown; note?: unknown } = {};
    try {
      parsed = JSON.parse(raw) as { ids?: unknown; note?: unknown };
    } catch {
      return { ok: false, error: "Grok returned unreadable rank." };
    }
    const order = Array.isArray(parsed.ids) ? parsed.ids.filter((id): id is string => typeof id === "string" && ids.has(id)) : [];
    for (const id of ids) if (!order.includes(id)) order.push(id);
    const note = typeof parsed.note === "string" ? parsed.note.slice(0, 140) : "";
    return { ok: true, ids: order, note };
  });
