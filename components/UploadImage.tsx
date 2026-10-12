"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";

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

export default function UploadImage({
  tenantId,
  bucket = "tenant-assets",
  folder = "images",
  currentUrl,
  onUpload,
  onRemove,
  label = "Immagine",
  hint = "JPG, PNG o WEBP · Max 5MB",
  aspect = "square",
  brandColor = "#25D366",
}: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aspectClass = {
    square: "aspect-square",
    wide: "aspect-[16/9]",
    video: "aspect-video",
  }[aspect];

  const handleFile = async (file: File) => {
    setError(null);

    if (file.size > 5 * 1024 * 1024) {
      setError("File troppo grande. Max 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Deve essere un'immagine.");
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${tenantId}/${folder}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Errore upload");
    } finally {
      setUploading(false);
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
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-2 text-xs mb-3">
          {error}
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
                <span className="text-xs font-semibold">Caricamento...</span>
              </>
            ) : (
              <>
                <ImageIcon size={28} />
                <span className="text-xs font-semibold">Carica immagine</span>
              </>
            )}
          </button>
        )}

        {uploading && currentUrl && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500 mt-2">{hint}</p>
    </div>
  );
}
