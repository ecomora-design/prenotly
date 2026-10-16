"use client";

export default function SkeletonMenu({ brandColor = "#25D366" }: { brandColor?: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 mt-5 pb-4 animate-pulse">
      {/* Categorie skeleton */}
      <div className="flex gap-2 mb-5 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 rounded-2xl bg-white"
            style={{ width: i % 2 === 0 ? "80px" : "110px" }}
          />
        ))}
      </div>

      {/* Titoli categoria skeleton */}
      <div className="h-6 w-32 bg-white rounded-lg mb-4" />

      {/* Item skeleton */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-3 flex gap-3">
            <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div
                  className="w-9 h-9 rounded-full"
                  style={{ backgroundColor: `${brandColor}30` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
