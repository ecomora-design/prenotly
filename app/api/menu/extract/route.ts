import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY non configurata");
  _openai = new OpenAI({ apiKey: key });
  return _openai;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const businessType = (formData.get("businessType") as string) || "food";

    if (!file) return NextResponse.json({ error: "File mancante" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File troppo grande (max 10MB)" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    const prompt = businessType === "food"
      ? `Analizza questo menu e estrai TUTTI i piatti/bevande. Per ogni voce: name, description, category, price. Restituisci SOLO JSON: {"items":[{"name":"...","description":"...","category":"...","price":0}]}`
      : `Analizza questo listino servizi e estrai TUTTI i servizi. Per ogni voce: name, description, category, price, duration_minutes. Restituisci SOLO JSON: {"items":[{"name":"...","description":"...","category":"...","price":0,"duration_minutes":30}]}`;

    let text = "";
    const openai = getOpenAI();

    if (mimeType.startsWith("image/")) {
      const c = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" } },
        ]}],
        response_format: { type: "json_object" },
        max_tokens: 4000,
      });
      text = c.choices[0]?.message?.content || "{}";
    } else if (mimeType === "application/pdf") {
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [{ role: "user", content: [
          { type: "input_text", text: prompt },
          { type: "input_file", filename: file.name, file_data: `data:application/pdf;base64,${base64}` },
        ]}],
      });
      text = response.output_text;
    } else {
      return NextResponse.json({ error: "Formato non supportato. Usa JPG, PNG, WEBP o PDF." }, { status: 400 });
    }

    const items = parseMenuJSON(text);
    if (items.length === 0) return NextResponse.json({ error: "Nessun elemento trovato. Prova con un'immagine più chiara." }, { status: 400 });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("Menu extract error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore" }, { status: 500 });
  }
}

function parseMenuJSON(text: string): any[] {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
    for (const key of Object.keys(parsed)) if (Array.isArray(parsed[key])) return parsed[key];
    return [];
  } catch { return []; }
}
