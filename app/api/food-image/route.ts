import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { name, description, category, businessType } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Nome mancante" }, { status: 400 });
    }

    // 1️⃣ PIXABAY (foto reali gratis)
    const pixabayKey = process.env.PIXABAY_API_KEY;
    if (pixabayKey) {
      const query = buildSearchQuery(name, category);
      const pixabayUrl = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=5&safesearch=true`;

      try {
        const res = await fetch(pixabayUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.hits && data.hits.length > 0) {
            const best = data.hits.find((h: any) => h.webformatWidth >= 600) || data.hits[0];
            return NextResponse.json({
              url: best.webformatURL,
              source: "pixabay",
            });
          }
        }
      } catch (err) {
        console.error("Pixabay error:", err);
      }
    }

    // 2️⃣ FALLBACK: DALL-E 3
    const prompt = buildDallEPrompt(name, description, category, businessType);

    const dalleRes = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const url = dalleRes.data[0]?.url;
    if (!url) {
      return NextResponse.json({ error: "Generazione fallita" }, { status: 500 });
    }

    return NextResponse.json({ url, source: "dall-e" });
  } catch (err) {
    console.error("Food image error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}

function buildSearchQuery(name: string, category?: string): string {
  const clean = name
    .toLowerCase()
    .replace(/\b(la|il|lo|le|i|gli|un|una|uno|di|del|della|con|e|al|alla)\b/g, "")
    .trim();
  return clean || category || "food";
}

function buildDallEPrompt(
  name: string,
  description?: string,
  category?: string,
  businessType?: string
): string {
  const isFood = businessType !== "services";

  if (isFood) {
    return `Professional food photography of "${name}"${
      description ? ` (${description})` : ""
    }. Shot from above on a white plate, natural soft lighting, shallow depth of field, appetizing, restaurant quality, minimal background, square composition. No text, no watermarks.`;
  }

  return `Professional photo representing the service "${name}"${
    description ? ` (${description})` : ""
  }. Clean minimal aesthetic, soft natural lighting, neutral background, professional, square composition. No text, no watermarks.`;
}

export const maxDuration = 60;
