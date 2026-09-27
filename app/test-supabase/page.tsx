import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestSupabase() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("tenants").select("*");

  return (
    <main className="min-h-screen p-10 bg-soft">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-night mb-6">
          Test Supabase 🧪
        </h1>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="font-bold text-red-700 mb-2">❌ Errore di connessione</p>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error.message}</pre>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <p className="font-bold text-waDark mb-2">✅ Connesso a Supabase!</p>
            <p className="text-gray-700">
              Tabella <code className="bg-white px-2 py-0.5 rounded">tenants</code> raggiungibile.
            </p>
            <p className="text-gray-700 mt-2">
              Record trovati: <strong>{data?.length ?? 0}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              (0 è normale — non hai ancora creato nessuna attività)
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
