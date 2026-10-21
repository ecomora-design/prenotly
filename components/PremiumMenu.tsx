"use client";

import { motion } from "framer-motion";
import { Plus, Minus, Search, Star, Flame, Award } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  image_url: string | null;
  is_featured?: boolean;
  is_popular?: boolean;
};

type Props = {
  services: Service[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  brandColor: string;
  addToCart: (s: Service) => void;
  removeFromCart: (id: string) => void;
  cart: Record<string, { service: Service; qty: number }>;
  view: string;
};

export default function PremiumMenu({
  services, categories, selectedCategory, setSelectedCategory,
  searchQuery, setSearchQuery, brandColor, addToCart, removeFromCart, cart, view
}: Props) {
  
  const featured = services.find(s => s.is_featured) || services.find(s => s.image_url) || services[0];
  const grouped = services.reduce((acc: Record<string, Service[]>, s) => {
    const cat = s.category || "Altro";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      {/* HERO - CONSIGLIO DELLO CHEF */}
      {featured && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-6 relative rounded-[32px] overflow-hidden shadow-2xl group h-[280px] md:h-[340px]"
        >
          {featured.image_url ? (
            <img src={featured.image_url} alt={featured.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: brandColor }}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <Award size={14} className="text-yellow-400" /> Consiglio dello Chef
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-2 drop-shadow-xl">{featured.name}</h2>
            {featured.description && (
              <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 max-w-lg">{featured.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-2xl md:text-3xl font-light text-white">€ {Number(featured.price).toFixed(2)}</span>
              {view === "order" && (
                <button
                  onClick={() => addToCart(featured)}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition active:scale-95 shadow-xl"
                >
                  <Plus size={18} /> Aggiungi
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* BARRA DI RICERCA E CATEGORIE */}
      <div className="sticky top-0 z-30 py-4 -mx-4 px-4 bg-[#F5F5F7]/90 backdrop-blur-xl border-b border-gray-200/50">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca nel menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-0 rounded-2xl pl-11 pr-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 transition"
            style={{ ["--tw-ring-color" as any]: `${brandColor}40` }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setSelectedCategory("tutto")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${selectedCategory === "tutto" ? "text-white shadow-lg" : "bg-white text-night/60 hover:text-night shadow-sm"}`}
            style={selectedCategory === "tutto" ? { backgroundColor: brandColor } : undefined}
          >
            Tutto
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${selectedCategory === cat ? "text-white shadow-lg" : "bg-white text-night/60 hover:text-night shadow-sm"}`}
              style={selectedCategory === cat ? { backgroundColor: brandColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA PIATTI STILE MENU CARTACEO */}
      <div className="mt-8">
        {Object.entries(grouped).map(([category, items], catIdx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.1 }}
            key={category} className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-night/10 flex-1"></div>
              <h3 className="text-2xl font-serif text-night italic font-medium tracking-wide">{category}</h3>
              <div className="h-px bg-night/10 flex-1"></div>
            </div>

            <div className="space-y-6">
              {items.map((item, idx) => {
                const qty = cart[item.id]?.qty || 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="group flex flex-col md:flex-row md:items-start gap-4 pb-6 border-b border-night/[0.06] last:border-0"
                  >
                    {/* Immagine (se c'è) */}
                    {item.image_url && (
                      <div className="w-full md:w-32 h-48 md:h-32 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    {/* Testo e Prezzo */}
                    <div className="flex-1 w-full">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h4 className="text-xl font-bold text-night font-serif">{item.name}</h4>
                        {item.is_popular && (
                          <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                            <Flame size={10} /> Il più ordinato
                          </span>
                        )}
                        {item.is_featured && !item.is_popular && (
                          <span className="bg-yellow-100 text-yellow-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                            <Star size={10} /> Chef
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-night/60 leading-relaxed font-light">{item.description}</p>
                      )}
                    </div>

                    {/* Azioni e Prezzo */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 mt-2 md:mt-0">
                      <span className="text-xl font-bold text-night tracking-tight">€ {Number(item.price).toFixed(2)}</span>
                      
                      {view === "order" && (qty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 rounded-full flex items-center gap-1.5 text-white shadow-sm font-bold text-xs hover:opacity-90 active:scale-95 transition"
                          style={{ backgroundColor: brandColor }}
                        >
                          <Plus size={14} /> Aggiungi
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 rounded-full p-1 bg-night/5 border border-night/10">
                          <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center active:scale-90 transition shadow-sm">
                            <Minus size={12} />
                          </button>
                          <span className="font-bold text-night w-5 text-center text-sm">{qty}</span>
                          <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition" style={{ backgroundColor: brandColor }}>
                            <Plus size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
