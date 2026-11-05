"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

type Staff = { id: string; name: string; color: string };
type Shift = {
  id: string;
  staff_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
};

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type Props = { tenantId: string; currentStaffId: string };

export default function ShiftsView({ tenantId, currentStaffId }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  async function load() {
    setRefreshing(true);
    const monday = new Date(weekStart);
    const sunday = new Date(weekStart);
    sunday.setDate(sunday.getDate() + 6);
    const mondayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(monday);
    const sundayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(sunday);

    const [staffRes, shiftsRes] = await Promise.all([
      supabase.from("staff").select("id, name, color").eq("tenant_id", tenantId).eq("is_active", true),
      supabase.from("staff_shifts").select("*").eq("tenant_id", tenantId).gte("shift_date", mondayStr).lte("shift_date", sundayStr).order("shift_date").order("start_time"),
    ]);

    setStaff(staffRes.data || []);
    setShifts(shiftsRes.data || []);
    setRefreshing(false);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tenantId, weekStart]);

  function getDayKey(offset: number): string {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(d);
  }

  function formatWeekRange() {
    const sunday = new Date(weekStart);
    sunday.setDate(sunday.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${weekStart.toLocaleDateString("it-IT", opts)} – ${sunday.toLocaleDateString("it-IT", opts)}`;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin text-night/30" size={24} /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-night flex items-center gap-2">
            <Calendar size={18} className="text-waDark" /> Turni settimanali
          </h2>
          <p className="text-xs text-night/50">{formatWeekRange()}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
            className="p-2 text-night/50 hover:text-night rounded-lg hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
            className="p-2 text-night/50 hover:text-night rounded-lg hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>
          <button onClick={load} disabled={refreshing} className="p-2 text-night/50 hover:text-night rounded-lg hover:bg-white ml-1">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-night/[0.06] overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px]">
          {DAYS.map((day, i) => {
            const dateStr = getDayKey(i);
            const dayShifts = shifts.filter(s => s.shift_date === dateStr);
            const isToday = dateStr === new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());

            return (
              <div key={day} className={`border-r border-night/[0.04] last:border-r-0 ${isToday ? "bg-wa/[0.03]" : ""}`}>
                <div className={`px-2 py-2 border-b border-night/[0.04] text-center ${isToday ? "bg-wa/10" : "bg-[#FAFBFC]"}`}>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isToday ? "text-waDark" : "text-night/40"}`}>{day}</p>
                  <p className={`text-lg font-black mt-0.5 ${isToday ? "text-waDark" : "text-night"}`}>
                    {new Date(dateStr + "T12:00:00").getDate()}
                  </p>
                </div>
                <div className="p-1.5 space-y-1.5 min-h-[250px]">
                  {dayShifts.length === 0 && (
                    <p className="text-[9px] text-night/30 text-center pt-3">—</p>
                  )}
                  {dayShifts.map(shift => {
                    const s = staff.find(x => x.id === shift.staff_id);
                    const isMe = shift.staff_id === currentStaffId;
                    return (
                      <div
                        key={shift.id}
                        className={`rounded-lg p-2 ${isMe ? "ring-2" : ""}`}
                        style={{
                          backgroundColor: (s?.color || "#25D366") + "20",
                          borderLeft: `3px solid ${s?.color || "#25D366"}`,
                          ...(isMe ? { boxShadow: `0 0 0 2px ${s?.color || "#25D366"}40` } : {})
                        }}
                      >
                        <p className={`text-[10px] font-black truncate ${isMe ? "text-night" : "text-night/80"}`}>
                          {s?.name || "?"} {isMe && <span className="text-[8px]">(tu)</span>}
                        </p>
                        <p className="text-[9px] text-night/60 font-bold flex items-center gap-0.5">
                          <Clock size={8} /> {shift.start_time.slice(0, 5)}-{shift.end_time.slice(0, 5)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
