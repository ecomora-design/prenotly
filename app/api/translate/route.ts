import { NextResponse } from "next/server";
import OpenAI from "openai";

const LANGUAGE_NAMES: Record<string, string> = {
  it: "Italian",
  en: "English",
  de: "German",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text: string = body.text;
    const targetLang: string = body.targetLang;

    if (!text || !targetLang || targetLang === "it") {
      return NextResponse.json({ translated: text });
    }

    const langName = LANGUAGE_NAMES[targetLang];
    if (!langName) {
      return NextResponse.json({ error: "Lingua non supportata" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY mancante");
      return NextResponse.json({ translated: text });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional translator for a restaurant menu. Translate the following description into ${langName}. Keep it natural, appetizing, and concise. Return ONLY the translated text, no quotes, no explanations.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const translated = completion.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({ translated });
  } catch (err: any) {
    console.error("Translation error:", err);
    return NextResponse.json({ translated: "", error: err?.message || "Errore" }, { status: 500 });
  }
}
