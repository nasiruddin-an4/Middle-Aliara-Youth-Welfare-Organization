"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import {
  Activity,
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  Image as ImageIcon,
  Film,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function ActivitiesPage() {
  const { content } = useLanguage();
  const [dbActivities, setDbActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const statusLabels = {
    ongoing: "চলমান",
    completed: "সম্পন্ন",
    upcoming: "আসন্ন",
  };

  const statusColors = {
    ongoing: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    upcoming: "bg-amber-100 text-amber-700 border-amber-200",
  };

  const categoryLabels = {
    welfare: "কল্যাণমূলক",
    education: "শিক্ষা",
    health: "স্বাস্থ্য",
    environment: "পরিবেশ",
    sports: "খেলাধুলা",
    cultural: "সাংস্কৃতিক",
    other: "অন্যান্য",
  };

  useEffect(() => {
    fetch("/api/activities")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDbActivities(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Combine DB activities with static fallback from content.json
  const allActivities = useMemo(() => {
    // If we have DB data, use it
    if (dbActivities.length > 0) return dbActivities;

    // Fallback to static data from content.json
    const staticActivities = content?.ongoing?.activities || [];
    return staticActivities.map((a, i) => ({
      _id: `static-${i}`,
      title: a.title,
      description: a.description,
      category: a.category || "other",
      date: a.date,
      location: "",
      status: "ongoing",
      media: [],
      featured: false,
      isStatic: true,
      staticIndex: i,
    }));
  }, [dbActivities, content]);

  const filtered = useMemo(() => {
    return allActivities.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [allActivities, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  const getActivityLink = (activity) => {
    if (activity.isStatic) return `/activities/${activity.staticIndex}`;
    return `/activities/${activity._id}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* ── Hero Section ── */}
      <div className="relative bg-[#051C14] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-emerald-300 text-sm font-medium mb-4">
            <Activity size={14} />
            কার্যক্রমসমূহ
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            চলমান কার্যক্রমসমূহ
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            মধ্য আলীয়ারা যুব কল্যাণ সংগঠনের সামাজিক ও উন্নয়নমূলক কার্যক্রমের
            বিস্তারিত তথ্য
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 -mt-6 relative z-10 pb-20">
        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="কার্যক্রম খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
              />
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-[#051C14] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                সবগুলো
              </button>
              {Object.entries(statusLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    filterStatus === key
                      ? "bg-[#051C14] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            মোট{" "}
            <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
            টি কার্যক্রম
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        )}

        {/* ── Activities Grid ── */}
        {!loading && paginated.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((activity) => (
              <Link
                key={activity._id}
                href={getActivityLink(activity)}
                className="group block"
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                  {/* Media */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    {activity.media && activity.media.length > 0 ? (
                      <>
                        {activity.media[0].type === "video" ? (
                          <video
                            src={activity.media[0].url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={activity.media[0].url}
                            alt={activity.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        {activity.media.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <Film size={10} />+{activity.media.length - 1}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                        <ImageIcon
                          size={48}
                          className="text-emerald-300 opacity-50"
                        />
                      </div>
                    )}

                    {/* Featured badge */}
                    {activity.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-white text-[10px] font-bold shadow-lg">
                          <Star size={10} /> বিশেষ
                        </span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                          statusColors[activity.status] ||
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {statusLabels[activity.status] || activity.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Category */}
                    {activity.category && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mb-2">
                        <Activity size={11} />
                        {categoryLabels[activity.category] || activity.category}
                      </span>
                    )}

                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {activity.title}
                    </h3>

                    {activity.description && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
                        {activity.description}
                      </p>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mt-auto pt-3 border-t border-gray-100">
                      {activity.date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} />
                          {activity.date}
                        </span>
                      )}
                      {activity.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          {activity.location}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                        বিস্তারিত দেখুন
                        <ArrowRight
                          size={14}
                          className="transform group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && paginated.length === 0 && (
          <div className="text-center py-20">
            <Activity size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-600 mb-1">
              কোনো কার্যক্রম পাওয়া যায়নি
            </h3>
            <p className="text-sm text-gray-400">
              অন্য ফিল্টার বা সার্চ করে দেখুন
            </p>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  page === p
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
