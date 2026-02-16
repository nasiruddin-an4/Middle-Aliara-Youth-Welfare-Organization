"use client";
import React, { useState } from "react";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import Link from "next/link";

const photos = [
  { id: 1, type: "landscape", src: null },
  { id: 2, type: "portrait", src: null },
  { id: 3, type: "portrait", src: null },
  { id: 4, type: "landscape", src: null },
  { id: 5, type: "landscape", src: null },
  { id: 6, type: "portrait", src: null },
];

export default function GallerySection() {
  const { content } = useLanguage();
  const { title, view_all_text } = content.gallery;
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-4">
              <ImageIcon size={16} /> Gallery
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">
              {title}
            </h2>
          </div>

          <Link
            href="/gallery"
            className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 text-slate-600 font-medium hover:bg-white hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            {view_all_text} <ArrowRight size={18} />
          </Link>
        </div>

        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className={`relative group rounded-2xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer ${
                // Determine span based on index/type to create a masonry feel
                i === 0
                  ? "col-span-2 row-span-2"
                  : i === 1
                    ? "row-span-2"
                    : i === 4
                      ? "col-span-2"
                      : ""
              }`}
            >
              <div
                className={`absolute inset-0 bg-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-700`}
              >
                {/* Placeholder for image - In real app, use photo.src */}
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt="Gallery"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={48} className="text-slate-400 opacity-50" />
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-medium text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  Community Event 2024
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 text-slate-600 font-medium hover:bg-white hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            {view_all_text} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Display Image */}
            {selectedPhoto.src ? (
              <img
                src={selectedPhoto.src}
                alt="Gallery Fullscreen"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div
                className="w-full h-[60vh] bg-slate-800 rounded-lg flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ImageIcon size={64} className="text-slate-500 opacity-50" />
                <p className="absolute mt-24 text-slate-500">
                  Image Placeholder
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
