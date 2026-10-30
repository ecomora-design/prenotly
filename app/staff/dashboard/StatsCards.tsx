"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, CheckCircle2, TrendingUp } from "lucide-react";

type Stats = {
  today: number;
  pending_today: number;
  week: number;
  month: number;
  completed_month: number;
  cancelled_month: number;
};

export default function StatsCards() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.rpc("get_my_staff_stats");
      if (error) {
        console.error("stats rpc error:", error);
        setLoading(false);
        return;
      }
      if (data && !data.error) setStats(data as Stats);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-night/[0.06] animate-pulse">
            <div className="h-3 bg-night/10 rounded w-1/2 mb-2" />
            <div className="h-6 bg-night/10 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Oggi", value: stats.today, icon: Calendar, color: "#3B82F6" },
    { label: "In attesa oggi", value: stats.pending_today, icon: Clock, color: "#EAB308" },
    { label: "Questa settimana", value: stats.week, icon: TrendingUp, color: "#8B5CF6" },
    { label: "Questo mese", value: stats.month, icon: CheckCircle2, color: "#10B981" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl p-4 border border-night/[0.06] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-night/50">{label}</span>
          </div>
          <p className="text-2xl font-black text-night">{value}</p>
        </div>
      ))}
    </div>
  );
}
