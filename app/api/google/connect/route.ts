import { NextResponse } from "next/server";
import { createOAuth2Client, SCOPES } from "@/lib/google/client";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const oauth2Client = createOAuth2Client();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state: user.id,
    });

    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("Google connect error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
