"use client";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-night/[0.06] p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-night/[0.05] mb-4" />
      <div className="h-3 w-20 bg-night/[0.05] rounded mb-3" />
      <div className="h-7 w-32 bg-night/[0.08] rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-night/[0.06] overflow-hidden animate-pulse">
      <div className="p-5 border-b border-night/[0.06]">
        <div className="h-4 w-32 bg-night/[0.08] rounded" />
      </div>
      <div className="divide-y divide-night/[0.04]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-night/[0.05]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-night/[0.08] rounded" />
              <div className="h-3 w-1/4 bg-night/[0.05] rounded" />
            </div>
            <div className="h-6 w-16 bg-night/[0.05] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
