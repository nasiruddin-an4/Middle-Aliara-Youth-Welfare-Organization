"use client";
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  ShieldCheck,
  Users,
  Sun,
  HandHeart,
  HeartHandshake,
  Trophy,
  Hammer, // For construction
  CheckCircle2,
  Globe,
  Shield,
  Handshake,
  Rocket,
  Goal,
} from "lucide-react";

// Icon mapping for dynamic content
const IconMap = {
  "shield-check": ShieldCheck,
  shield: Shield,
  users: Users,
  sun: Sun,
  "hand-heart": HandHeart,
  "heart-handshake": HeartHandshake,
  trophy: Trophy,
  construction: Hammer,
  "check-circle": CheckCircle2,
  globe: Globe,
  handshake: Handshake,
  rocket: Rocket,
  goal: Goal,
};

export default function AboutPage() {
  const { content } = useLanguage();
  const { hero_section, goals_section } = content.about_page || {};

  // Safeguard if content isn't loaded yet
  if (!hero_section || !goals_section) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-[#051C14] text-white pt-24 pb-48 lg:pb-64 overflow-visible">
        {/* Background Gradients/Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="lg:w-1/2 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 text-xs font-medium mb-6">
                <ShieldCheck size={14} />
                {hero_section.title_badge}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight mb-6">
                {hero_section.title}
              </h1>

              {/* Description */}
              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
                {hero_section.description}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50 hover:bg-emerald-900/50 transition-colors text-white font-medium">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  {hero_section.buttons.primary.text}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-colors text-white font-medium">
                  <Users size={18} className="text-blue-400" />
                  {hero_section.buttons.secondary.text}
                </button>
              </div>
            </div>

            {/* Right Content - Pledge Card */}
            <div className="lg:w-5/12 w-full">
              <div className="bg-[#0F2922] border border-emerald-900/50 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                <h3 className="text-2xl font-bold mb-8 relative z-10">
                  {hero_section.pledge_card.title}
                </h3>

                <div className="space-y-6 relative z-10">
                  {hero_section.pledge_card.items.map((item, idx) => {
                    const ItemIcon = IconMap[item.icon] || Shield;
                    return (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="mt-1 p-2 rounded-lg bg-emerald-900/40 text-emerald-400 shrink-0">
                          <ItemIcon size={18} />
                        </div>
                        <p className="text-gray-300 text-sm font-medium pt-2">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gray-600 border-2 border-[#0F2922]"
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-[#0F2922] flex items-center justify-center text-[10px] font-bold">
                      +42
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">
                    {hero_section.pledge_card.active_members_text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cards (Overlapping) */}
        <div className="absolute bottom-0 left-0 w-full translate-y-1/2 z-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hero_section.floating_cards.map((card, idx) => {
                const CardIcon = IconMap[card.icon];
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex flex-col items-start gap-4 h-full"
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        idx === 0
                          ? "bg-emerald-50 text-emerald-600"
                          : idx === 1
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <CardIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        {card.title}
                      </h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* --- GOALS SECTION --- */}
      <section className="pt-48 pb-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4 uppercase tracking-wider">
              <Rocket size={14} />
              {goals_section.badge}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-900 mb-6">
              {goals_section.title}
            </h2>
            <p className="text-slate-500 text-lg">
              {goals_section.description}
            </p>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals_section.cards.map((card, idx) => {
              const CardIcon = IconMap[card.icon] || CheckCircle2;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 group"
                >
                  <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    <CardIcon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
