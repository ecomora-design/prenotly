"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, Download, QrCode, Copy, Check,
  MessageCircle, Share2
} from "lucide-react";

export default function QRPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<"minimal" | "branded" | "dark">("branded");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link || !link.tenants) { router.push("/onboarding"); return; }
      setTenant(link.tenants);
      setLoading(false);
    }
    load();
  }, []);

  // Genera QR quando il tenant è caricato
  useEffect(() => {
    if (!tenant) return;
    generateQR();
  }, [tenant, style]);

  async function generateQR() {
    if (!tenant) return;

    const url = `https://prenotly-italia.it/${tenant.slug}`;
    const brandColor = tenant.brand_color || "#25D366";

    // Configurazione basata sullo stile scelto
    const configs = {
      minimal: {
        color: "#0F172A",
        bg: "#FFFFFF",
        logo: false,
      },
      branded: {
        color: brandColor,
        bg: "#FFFFFF",
        logo: true,
      },
      dark: {
        color: "#FFFFFF",
        bg: "#0F172A",
        logo: true,
      },
    };

    const config = configs[style];

    try {
      const QRCodeStyling = (await import("qr-code-styling")).default;
      const qr = new QRCodeStyling({
        width: 800,
        height: 800,
        type: "svg",
        data: url,
        image: config.logo && tenant.logo_url ? tenant.logo_url : undefined,
        margin: 40,
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 8,
          imageSize: 0.3,
        },
        dotsOptions: {
          color: config.color,
          type: "rounded",
        },
        backgroundOptions: {
          color: config.bg,
        },
        cornersSquareOptions: {
          color: config.color,
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: config.color,
          type: "dot",
        },
      });

      const blob = await qr.getRawData("png");
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        setQrDataUrl(url);
      }
    } catch (err) {
      console.error("QR error:", err);
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl || !tenant) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-${tenant.slug}.png`;
    a.click();
  };

  const handleCopyLink = async () => {
    const url = `https://prenotly-italia.it/${tenant.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `https://prenotly-italia.it/${tenant.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: tenant.business_name,
        text: `Ordina da ${tenant.business_name}`,
        url,
      });
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  const publicUrl = `prenotly-italia.it/${tenant.slug}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">
          Il tuo QR Code
        </h1>
        <p className="text-gray-500 text-sm">
          Stampalo, mettilo sul menu o sui tavoli. I clienti inquadrano e ordinano.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR PREVIEW */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 flex flex-col items-center">
          <div className="text-center mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Anteprima
            </p>
            <p className="text-sm font-semibold text-night">{tenant.business_name}</p>
          </div>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="w-full max-w-xs rounded-2xl shadow-lg"
            />
          ) : (
            <div className="w-full max-w-xs aspect-square bg-soft rounded-2xl flex items-center justify-center">
              <Loader2 className="animate-spin text-wa" size={32} />
            </div>
          )}

          <p className="text-xs text-gray-400 font-mono mt-6">{publicUrl}</p>
        </div>

        {/* CONTROLLI */}
        <div className="space-y-4">
          {/* Stile */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm font-semibold text-night mb-3">Stile</p>
            <div className="grid grid-cols-3 gap-2">
              {(["minimal", "branded", "dark"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-2.5 rounded-xl text-xs font-bold capitalize transition ${
                    style === s
                      ? "bg-wa text-white"
                      : "bg-soft text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {s === "minimal" ? "Minimal" : s === "branded" ? "Branded" : "Dark"}
                </button>
              ))}
            </div>
          </div>

          {/* Azioni */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2.5">
            <p className="text-sm font-semibold text-night mb-3">Azioni</p>

            <button
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="w-full bg-wa hover:bg-waDark disabled:bg-gray-300 text-white py-3.5 rounded-xl font-bold text-sm transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Download size={18} />
              Scarica QR (PNG)
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full border border-gray-200 hover:border-night text-night py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-wa" />
                  Link copiato!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copia link
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="w-full border border-gray-200 hover:border-night text-night py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Share2 size={18} />
              Condividi
            </button>
          </div>

          {/* Idee d'uso */}
          <div className="bg-cream rounded-2xl p-5">
            <p className="text-sm font-bold text-night mb-3">💡 Dove metterlo</p>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-waDark">✓</span>
                <span>Sul menu fisico, in copertina</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-waDark">✓</span>
                <span>Su un adesivo al tavolo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-waDark">✓</span>
                <span>Sulla vetrina del locale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-waDark">✓</span>
                <span>Sui biglietti da visita</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-waDark">✓</span>
                <span>Nelle storie Instagram</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
