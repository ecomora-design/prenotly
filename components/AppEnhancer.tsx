"use client";

import { useEffect } from "react";

type Props = {
  brandColor: string;
  tenantName: string;
};

export default function AppEnhancer({ brandColor, tenantName }: Props) {
  useEffect(() => {
    // 1. Colore status bar (Android)
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      (meta as HTMLMetaElement).name = "theme-color";
      document.head.appendChild(meta);
    }
    (meta as HTMLMetaElement).content = brandColor;

    // 2. Colore status bar iOS
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMeta) {
      appleMeta = document.createElement("meta");
      (appleMeta as HTMLMetaElement).name = "apple-mobile-web-app-status-bar-style";
      document.head.appendChild(appleMeta);
    }
    (appleMeta as HTMLMetaElement).content = "black-translucent";

    // 3. Vibrazione all'apertura (solo mobile, solo prima volta)
    const key = `vib_${tenantName}`;
    if (
      !sessionStorage.getItem(key) &&
      "vibrate" in navigator &&
      window.matchMedia("(max-width: 768px)").matches
    ) {
      setTimeout(() => {
        navigator.vibrate(30);
        sessionStorage.setItem(key, "1");
      }, 200);
    }

    // 4. Previeni zoom su doppio tap
    let lastTouch = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouch <= 300) {
        e.preventDefault();
      }
      lastTouch = now;
    };
    document.addEventListener("touchend", preventZoom, { passive: false });

    // 5. Disabilita selezione testo (più "app-like")
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    (document.body.style as any).webkitTouchCallout = "none";

    return () => {
      document.removeEventListener("touchend", preventZoom);
    };
  }, [brandColor, tenantName]);

  return null;
}
