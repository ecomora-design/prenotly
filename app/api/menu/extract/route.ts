import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const businessType = (formData.get("businessType") as string) || "food";

    if (!file) {
      return NextResponse.json({ error: "File mancante" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File troppo grande (max 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    // Prompt personalizzato per tipo di attività
    const prompt = businessType === "food"
      ? `Analizza questo menu di un ristorante/pizzeria e estrai TUTTI i piatti e bevande.

Per ogni voce:
- name: nome del piatto (obbligatorio)
- description: ingredienti/descrizione breve (se presente)
- category: categoria (es. "Antipasti", "Primi", "Pizze", "Bevande", "Dolci")
- price: prezzo in euro come numero decimale (es. 7.50). Se non c'è, metti 0

Restituisci SOLO un JSON valido:
{"items":[{"name":"...","description":"...","category":"...","price":0}]}

Non aggiungere testo extra, solo JSON.`
      : `Analizza questo listino servizi di un'attività (parrucchiere, studio, palestra, ecc.) e estrai TUTTI i servizi.

Per ogni voce:
- name: nome del servizio (obbligatorio)
- description: descrizione breve (se presente)
- category: categoria (es. "Taglio", "Colore", "Trattamenti", "Consulenze")
- price: prezzo in euro come numero decimale (es. 35.00). Se non c'è, metti 0
- duration_minutes: durata in minuti (se indicata). Altrimenti 30

Restituisci SOLO un JSON valido:
{"items":[{"name":"...","description":"...","category":"...","price":0,"duration_minutes":30}]}

Non aggiungere testo extra, solo JSON.`;

    let text = "";

    // Immagini → usa Vision
    if (mimeType.startsWith("image/")) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
      });
      text = completion.choices[0]?.message?.content || "{}";
    }
    // PDF → usa Responses API con input_file
    else if (mimeType === "application/pdf") {
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              {
                type: "input_file",
                filename: file.name,
                file_data: `data:application/pdf;base64,${base64}`,
              },
            ],
          },
        ],
      });
      text = response.output_text;
    } else {
      return NextResponse.json(
        { error: "Formato non supportato. Usa JPG, PNG, WEBP o PDF." },
        { status: 400 }
      );
    }

    // Parse JSON robusto
    const items = parseMenuJSON(text);

    if (items.length === 0) {
      return NextResponse.json({
        error: "Nessun piatto trovato. Prova con un'immagine più chiara o un PDF."
      }, { status: 400 });
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Menu extract error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore durante l'analisi" },
      { status: 500 }
    );
  }
}

function parseMenuJSON(text: string): any[] {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) return parsed;
    if (parsed.items && Array.isArray(parsed.items)) return parsed.items;

    // Fallback: cerca array dentro oggetto
    for (const key of Object.keys(parsed)) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }

    return [];
  } catch (err) {
    console.error("Parse error:", err, text.slice(0, 300));
    return [];
  }
}
