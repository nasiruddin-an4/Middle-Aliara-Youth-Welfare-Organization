"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import {
  Activity,
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Film,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Share2,
  Tag,
  Play,
  X,
} from "lucide-react";

export default function ActivityDetailPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { content } = useLanguage();
  const [activity, setActivity] = useState(null);
  const [relatedActivities, setRelatedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const galleryRef = useRef(null);

  const categoryLabels = {
    welfare: "কল্যাণমূলক",
    education: "শিক্ষা",
    health: "স্বাস্থ্য",
    environment: "পরিবেশ",
    sports: "খেলাধুলা",
    cultural: "সাংস্কৃতিক",
    other: "অন্যান্য",
  };

  const statusLabels = {
    ongoing: "চলমান",
    completed: "সম্পন্ন",
    upcoming: "আসন্ন",
  };

  const statusColors = {
    ongoing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    upcoming: "bg-amber-100 text-amber-700",
  };

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);

      // Check if it's a numeric index (static data from content.json)
      const isStaticIndex = /^\d+$/.test(id);

      if (isStaticIndex) {
        const staticActivities = content?.ongoing?.activities || [];
        const index = parseInt(id, 10);
        if (index >= 0 && index < staticActivities.length) {
          const a = staticActivities[index];
          setActivity({
            _id: `static-${index}`,
            title: a.title,
            description: a.description,
            category: a.category || "other",
            date: a.date,
            location: "",
            status: "ongoing",
            media: [],
            featured: false,
            isStatic: true,
          });

          // Related static activities
          const related = staticActivities
            .filter((_, i) => i !== index)
            .slice(0, 3)
            .map((ra, i) => ({
              _id: `static-${i >= index ? i + 1 : i}`,
              title: ra.title,
              description: ra.description,
              category: ra.category || "other",
              date: ra.date,
              media: [],
              status: "ongoing",
              staticIndex: i >= index ? i + 1 : i,
            }));
          setRelatedActivities(related);
        }
        setLoading(false);
        return;
      }

      // Fetch from DB
      try {
        const res = await fetch(`/api/activities/${id}`);
        const data = await res.json();
        if (data.success) {
          setActivity(data.data);

          // Fetch related
          const allRes = await fetch("/api/activities");
          const allData = await allRes.json();
          if (allData.success) {
            const related = allData.data
              .filter((a) => a._id !== id)
              .slice(0, 3);
            setRelatedActivities(related);
          }
        }
      } catch {
        // Try static fallback
        const staticActivities = content?.ongoing?.activities || [];
        if (staticActivities.length > 0) {
          const a = staticActivities[0];
          setActivity({
            _id: "static-0",
            title: a.title,
            description: a.description,
            category: a.category || "other",
            date: a.date,
            location: "",
            status: "ongoing",
            media: [],
            featured: false,
            isStatic: true,
          });
        }
      }
      setLoading(false);
    };

    fetchActivity();
  }, [id, content]);

  const openLightbox = (index) => {
    setCurrentMediaIndex(index);
    setSelectedMedia(activity.media[index]);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    document.body.style.overflow = "";
  };

  const navigateMedia = (direction) => {
    if (!activity?.media?.length) return;
    let newIndex;
    if (direction === "next") {
      newIndex = (currentMediaIndex + 1) % activity.media.length;
    } else {
      newIndex =
        (currentMediaIndex - 1 + activity.media.length) % activity.media.length;
    }
    setCurrentMediaIndex(newIndex);
    setSelectedMedia(activity.media[newIndex]);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activity?.title,
        text: activity?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getRelatedLink = (rel) => {
    if (rel.staticIndex !== undefined) return `/activities/${rel.staticIndex}`;
    return `/activities/${rel._id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center">
        <Activity size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">
          কার্যক্রম পাওয়া যায়নি
        </h2>
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold mt-4"
        >
          <ArrowLeft size={14} />
          সবগুলো কার্যক্রম দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* ── Hero / Banner ── */}
      <div className="relative bg-[#051C14] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>

        {/* Hero image / first media */}
        {activity.media && activity.media.length > 0 && (
          <div className="absolute inset-0">
            {activity.media[0].type === "video" ? (
              <video
                src={activity.media[0].url}
                className="w-full h-full object-cover opacity-30"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={activity.media[0].url}
                alt=""
                className="w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#051C14]/70 via-[#051C14]/80 to-[#051C14]" />
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              হোম
            </Link>
            <span>/</span>
            <Link
              href="/activities"
              className="hover:text-white transition-colors"
            >
              কার্যক্রমসমূহ
            </Link>
            <span>/</span>
            <span className="text-emerald-300 truncate max-w-[200px]">
              {activity.title}
            </span>
          </nav>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-lg ${
                statusColors[activity.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {statusLabels[activity.status] || activity.status}
            </span>
            {activity.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-lg bg-white/10 text-emerald-300">
                <Tag size={10} />
                {categoryLabels[activity.category] || activity.category}
              </span>
            )}
            {activity.featured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-lg bg-amber-400/20 text-amber-300">
                <Star size={10} /> বিশেষ কার্যক্রম
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight max-w-3xl">
            {activity.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            {activity.date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} />
                {activity.date}
              </span>
            )}
            {activity.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {activity.location}
              </span>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              শেয়ার করুন
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 -mt-6 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Media Gallery */}
            {activity.media && activity.media.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Primary media */}
                <div
                  className="relative aspect-video cursor-pointer group"
                  onClick={() => openLightbox(0)}
                >
                  {activity.media[0].type === "video" ? (
                    <>
                      <video
                        src={activity.media[0].url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play
                            size={28}
                            className="text-emerald-600 ml-1"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={activity.media[0].url}
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  )}
                </div>

                {/* Thumbnail strip */}
                {activity.media.length > 1 && (
                  <div
                    className="p-3 flex gap-2 overflow-x-auto"
                    ref={galleryRef}
                  >
                    {activity.media.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightbox(idx)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          currentMediaIndex === idx
                            ? "border-emerald-500 ring-2 ring-emerald-500/30"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        {m.type === "video" ? (
                          <>
                            <video
                              src={m.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play
                                size={12}
                                className="text-white"
                                fill="white"
                              />
                            </div>
                          </>
                        ) : (
                          <img
                            src={m.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* No media placeholder */}
            {(!activity.media || activity.media.length === 0) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon
                      size={64}
                      className="mx-auto text-emerald-300 mb-3 opacity-60"
                    />
                    <p className="text-sm text-emerald-500 font-medium">
                      এই কার্যক্রমের জন্য কোনো ছবি/ভিডিও আপলোড হয়নি
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-emerald-600" />
                বিস্তারিত বিবরণ
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {activity.description ? (
                  activity.description.split("\n").map((paragraph, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-400 italic">
                    এই কার্যক্রমের জন্য কোনো বিস্তারিত বিবরণ দেওয়া হয়নি।
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                কার্যক্রমের তথ্য
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      তারিখ
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {activity.date || "তারিখ নির্ধারিত নয়"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      স্থান
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {activity.location || "মধ্য আলীয়ারা"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Tag size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      ক্যাটাগরি
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {categoryLabels[activity.category] ||
                        activity.category ||
                        "অন্যান্য"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Activity size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      স্ট্যাটাস
                    </p>
                    <span
                      className={`inline-flex text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                        statusColors[activity.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[activity.status] || activity.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">এই কার্যক্রমে অংশ নিন</h3>
              <p className="text-emerald-100 text-sm mb-4 leading-relaxed">
                আমাদের সকল কার্যক্রমে আপনার অংশগ্রহণ ও সহযোগিতা কাম্য।
              </p>
              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-xl bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 size={14} />
                শেয়ার করুন
              </button>
            </div>
          </div>
        </div>

        {/* ── Related Activities ── */}
        {relatedActivities.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                আরও কার্যক্রম
              </h2>
              <Link
                href="/activities"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                সব দেখুন <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedActivities.map((rel) => (
                <Link
                  key={rel._id}
                  href={getRelatedLink(rel)}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      {rel.media && rel.media.length > 0 ? (
                        rel.media[0].type === "video" ? (
                          <video
                            src={rel.media[0].url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={rel.media[0].url}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                          <ImageIcon
                            size={40}
                            className="text-emerald-300 opacity-50"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-gray-800 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {rel.title}
                      </h3>
                      {rel.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                          {rel.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        বিস্তারিত
                        <ArrowRight
                          size={12}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox Modal ── */}
      {selectedMedia && activity.media && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Navigation */}
          {activity.media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia("prev");
                }}
                className="absolute left-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia("next");
                }}
                className="absolute right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Media */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                className="max-w-full max-h-[80vh] rounded-xl shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt={activity.title}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* Counter */}
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-white/70 text-sm font-medium">
              {currentMediaIndex + 1} / {activity.media.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
