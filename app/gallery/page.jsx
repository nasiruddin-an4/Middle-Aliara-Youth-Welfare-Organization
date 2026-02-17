"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import galleryData from "../data/gallery.json";
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Download,
  ZoomIn,
  Search,
} from "lucide-react";

const { categories, photos } = galleryData;

export default function GalleryPage() {
  const { content } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchCategory =
        activeCategory === "all" || photo.category === activeCategory;
      const matchSearch =
        !searchTerm ||
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchTerm]);

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const openLightbox = (photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = "";
  };

  const navigatePhoto = (direction) => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === selectedPhoto.id,
    );
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % filteredPhotos.length;
    } else {
      newIndex =
        (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    }
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = [
      "জানুয়ারি",
      "ফেব্রুয়ারি",
      "মার্চ",
      "এপ্রিল",
      "মে",
      "জুন",
      "জুলাই",
      "আগস্ট",
      "সেপ্টেম্বর",
      "অক্টোবর",
      "নভেম্বর",
      "ডিসেম্বর",
    ];
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  };

  const getCategoryLabel = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.label : categoryId;
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
            <ImageIcon size={14} />
            ফটো গ্যালারি
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            আমাদের কার্যক্রমের ছবি
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            মধ্য আলীয়ারা যুব কল্যাণ সংগঠনের বিভিন্ন কার্যক্রম ও ইভেন্টের
            স্মরণীয় মুহূর্তগুলো
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
                placeholder="ছবি খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#051C14] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            মোট{" "}
            <span className="font-bold text-gray-800">
              {filteredPhotos.length}
            </span>{" "}
            টি ছবি
          </p>
        </div>

        {/* ── Masonry Grid ── */}
        {filteredPhotos.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => openLightbox(photo)}
              >
                <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden ${
                      index % 3 === 0
                        ? "aspect-[4/3]"
                        : index % 3 === 1
                          ? "aspect-square"
                          : "aspect-[3/4]"
                    }`}
                  >
                    {imageErrors[photo.id] ? (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center">
                        <ImageIcon
                          size={48}
                          className="text-emerald-300 mb-2"
                        />
                        <p className="text-xs text-emerald-400">
                          ছবি লোড হচ্ছে না
                        </p>
                      </div>
                    ) : (
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={() => handleImageError(photo.id)}
                      />
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] text-white font-medium">
                            <Tag size={9} />
                            {getCategoryLabel(photo.category)}
                          </span>
                          {photo.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/80 text-[10px] text-white font-bold">
                              ★ বিশেষ
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-bold text-sm mb-1">
                          {photo.title}
                        </h3>
                        <p className="text-white/70 text-[11px] line-clamp-2 mb-2">
                          {photo.description}
                        </p>
                        <div className="flex items-center gap-1 text-white/50 text-[10px]">
                          <Calendar size={9} />
                          {formatDate(photo.date)}
                        </div>
                      </div>
                    </div>

                    {/* Zoom icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <ZoomIn size={14} className="text-white" />
                    </div>

                    {/* Featured badge */}
                    {photo.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500 text-[10px] text-white font-bold shadow-lg group-hover:opacity-0 transition-opacity">
                          ★ বিশেষ
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info below image */}
                  <div className="p-3.5">
                    <h3 className="text-sm font-bold text-gray-800 mb-0.5 truncate">
                      {photo.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(photo.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ImageIcon size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-600 mb-1">
              কোনো ছবি পাওয়া যায়নি
            </h3>
            <p className="text-sm text-gray-400">
              অন্য ক্যাটাগরি বা সার্চ করে দেখুন
            </p>
          </div>
        )}
      </div>

      {/* ── Lightbox Modal ── */}
      {selectedPhoto && (
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

          {/* Navigation arrows */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto("prev");
                }}
                className="absolute left-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto("next");
                }}
                className="absolute right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image + Info */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative w-full flex items-center justify-center">
              {imageErrors[selectedPhoto.id] ? (
                <div className="w-full h-[60vh] bg-gray-900 rounded-2xl flex flex-col items-center justify-center">
                  <ImageIcon size={64} className="text-gray-600 mb-3" />
                  <p className="text-gray-500">ছবি লোড হচ্ছে না</p>
                </div>
              ) : (
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                  onError={() => handleImageError(selectedPhoto.id)}
                />
              )}
            </div>

            {/* Info bar */}
            <div className="w-full mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-300 font-semibold">
                    <Tag size={9} />
                    {getCategoryLabel(selectedPhoto.category)}
                  </span>
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                    <Calendar size={9} />
                    {formatDate(selectedPhoto.date)}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base">
                  {selectedPhoto.title}
                </h3>
                <p className="text-white/60 text-xs mt-0.5">
                  {selectedPhoto.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Photo counter */}
                <span className="text-white/40 text-xs font-medium">
                  {filteredPhotos.findIndex((p) => p.id === selectedPhoto.id) +
                    1}
                  /{filteredPhotos.length}
                </span>

                <a
                  href={selectedPhoto.src}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                >
                  <Download size={14} />
                  ডাউনলোড
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
