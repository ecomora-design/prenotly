"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, X, ImageIcon, Camera } from "lucide-react";

type Props = {
  tenantId: string;
  bucket?: string;
  folder?: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  hint?: string;
  aspect?: "square" | "wide" | "video";
  brandColor?: string;
};

// Converte qualsiasi immagine (HEIC, HEIF, WEBP, ecc.) in JPEG compresso
async function compressImage(file: File, maxSize = 1200, quality = 0.82): Promise<File> {
  // Se il file è già piccolo e non è HEIC, lo lascio com'è
  if (file.size < 500 * 1024 && !/heic|heif/i.test(file.type)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Timeout conversione immagine"));
    }, 30000);

    img.onload = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas non supportato"));
        return;
      }

      // Sfondo bianco (per PNG con trasparenza convertiti in JPEG)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Conversione fallita"));
            return;
          }
          const newFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
          resolve(newFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error("Impossibile leggere l'immagine. Prova a scattare di nuovo."));
    };

    img.src = url;
  });
}

export default function UploadImage({
  tenantId,
  bucket = "tenant-assets",
  folder = "images",
  currentUrl,
  onUpload,
  onRemove,
  label = "Immagine",
  hint = "JPG, PNG, HEIC · Max 20MB",
  aspect = "square",
  brandColor = "#25D366",
}: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const aspectClass = {
    square: "aspect-square",
    wide: "aspect-[16/9]",
    video: "aspect-video",
  }[aspect];

  const handleFile = async (file: File) => {
    setError(null);
    setProgress("Preparazione...");

    if (!file.type.startsWith("image/") && !/heic|heif/i.test(file.name)) {
      setError("Il file selezionato non è un'immagine.");
      return;
    }

    // Limite 20MB per input (verrà compresso)
    if (file.size > 20 * 1024 * 1024) {
      setError("File troppo grande. Max 20MB.");
      return;
    }

    setUploading(true);

    try {
      // 1. Comprimi l'immagine (converte HEIC → JPEG)
      setProgress("Ottimizzazione...");
      let processedFile: File;
      try {
        processedFile = await compressImage(file);
      } catch (compressErr: any) {
        // Se la conversione fallisce ma il file è già JPEG/WEBP, prova a caricarlo
        if (/jpeg|jpg|webp|png/i.test(file.type)) {
          processedFile = file;
        } else {
          throw new Error(compressErr.message || "Formato non supportato. Prova a scattare la foto con un'altra app.");
        }
      }

      // 2. Carica su Supabase
      setProgress("Caricamento...");
      const ext = processedFile.name.split(".").pop() || "jpg";
      const fileName = `${tenantId}/${folder}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, processedFile, {
          cacheControl: "31536000",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // 3. Ottieni URL pubblico
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
      setProgress("");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Errore durante il caricamento. Riprova.");
    } finally {
      setUploading(false);
      setProgress("");
      // Reset input per permettere di scegliere la stessa foto di nuovo
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onUpload("");
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <span className="text-sm font-semibold text-night mb-2 block">{label}</span>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-2 text-xs mb-3 flex items-start gap-2">
          <span className="shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className={`relative ${aspectClass} w-full max-w-xs rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-soft group`}>
        {currentUrl ? (
          <>
            <img
              src={currentUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="bg-white text-night w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition"
                  aria-label="Cambia"
                >
                  <Upload size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition"
                  aria-label="Rimuovi"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs font-semibold">{progress || "Caricamento..."}</span>
              </>
            ) : (
              <>
                <Camera size={28} />
                <span className="text-xs font-semibold">Scatta o carica</span>
                <span className="text-[10px] text-gray-400">JPG · PNG · HEIC</span>
              </>
            )}
          </button>
        )}

        {uploading && currentUrl && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-white" size={28} />
            <span className="text-xs font-semibold text-white">{progress || "Caricamento..."}</span>
          </div>
        )}
      </div>

      {/* Input sempre montato, accept="image/*" per supportare HEIC iOS */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500 mt-2">{hint}</p>
    </div>
  );
}
