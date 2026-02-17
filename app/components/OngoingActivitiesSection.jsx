"use client";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import Link from "next/link";

export default function OngoingActivitiesSection() {
  const { content } = useLanguage();
  const { title, view_all_text, card_button_text } = content.ongoing;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Sort by date desc (if not already) and take latest 6
          setActivities(data.data.slice(0, 6));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Auto-play functionality with Scroll Snap
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      // Calculate next scroll position
      const itemWidth = container.children[0].offsetWidth;
      const gap = 24; // matches gap-6 (1.5rem = 24px)
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      // If we are near the end, loop back to start, else scroll next
      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
      }
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [activities]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const itemWidth = container.children[0].offsetWidth;
      const gap = 24;
      container.scrollBy({ left: -(itemWidth + gap), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const itemWidth = container.children[0].offsetWidth;
      const gap = 24;
      container.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Centered */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 font-serif">
            {title}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Carousel Container Wrapper for Absolute Arrows */}
        <div className="relative group">
          {/* Absolute Navigation Arrows */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-full lg:-translate-x-12 z-10 w-12 h-12 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-full lg:translate-x-12 z-10 w-12 h-12 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              <div className="w-full flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="w-full text-center text-gray-400 py-10">
                কোনো কার্যক্রম পাওয়া যায়নি
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={activity._id || index} className="w-[387px] snap-start shrink-0">
                  <Link href={`/activities/${activity._id}`} className="block h-full">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group/card">
                      {/* Image Area */}
                      <div className="relative aspect-video bg-gray-200 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100 group-hover/card:scale-105 transition-transform duration-500">
                          {activity.media && activity.media.length > 0 ? (
                            activity.media[0].type === "video" ? (
                              <video
                                src={activity.media[0].url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                            ) : (
                              <img
                                src={activity.media[0].url}
                                alt={activity.title}
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <ImageIcon size={48} className="opacity-40" />
                          )}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 flex flex-col flex-grow">
                        {/* Category */}
                        {activity.category && (
                          <div className="flex items-center gap-2 mb-3">
                            <Send
                              size={14}
                              className="text-amber-500 rotate-[-45deg]"
                            />
                            <span className="text-amber-500 font-medium text-sm">
                              {activity.category}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover/card:text-primary transition-colors line-clamp-2">
                          {activity.title}
                        </h3>

                        {/* Description */}
                        {activity.description && (
                          <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                            {activity.description}
                          </p>
                        )}

                        {/* Button */}
                        <div className="mt-auto">
                          <span className="block w-full text-center py-2.5 rounded-lg border border-primary/30 text-primary font-semibold group-hover/card:bg-primary group-hover/card:text-white transition-all duration-300 text-sm">
                            {card_button_text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Navigation controls bottom */}
        <div className="flex gap-4 justify-center md:hidden mt-2 mb-8">
          <button
            onClick={scrollLeft}
            className="p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="p-3 rounded-full bg-primary text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Bottom CTA Button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/activities"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-[#008a50] text-white font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all transform hover:-translate-y-1"
          >
            {view_all_text} <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
