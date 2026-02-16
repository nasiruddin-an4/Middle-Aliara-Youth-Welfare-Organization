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
    <div className="min-h-screen pb-20 overflow-x-hidden font-sans">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-[#051C14] text-white pt-32 pb-64 lg:pb-80 overflow-visible">
        {/* Background Gradients/Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-0 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
            {/* Left Content */}
            <div className="lg:w-1/2 text-left space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-sm font-medium shadow-lg shadow-emerald-900/20 backdrop-blur-sm">
                <ShieldCheck size={16} />
                {hero_section.title_badge}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-400 drop-shadow-sm">
                {hero_section.title}
              </h1>

              {/* Description */}
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl border-l-2 border-emerald-500/30 pl-6">
                {hero_section.description}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-5 pt-4">
                <button className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95">
                  <ShieldCheck
                    size={20}
                    className="text-emerald-100 group-hover:rotate-12 transition-transform"
                  />
                  {hero_section.buttons.primary.text}
                </button>
                <button className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                  <Users
                    size={20}
                    className="text-blue-400 group-hover:scale-110 transition-transform"
                  />
                  {hero_section.buttons.secondary.text}
                </button>
              </div>
            </div>

            {/* Right Content - Pledge Card */}
            <div className="lg:w-5/12 w-full lg:translate-y-8">
              <div className="bg-[#0F2922]/90 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-emerald-900/50 group hover:border-emerald-500/30 transition-all duration-500">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <h3 className="text-2xl font-bold mb-8 relative z-10 font-serif text-white">
                  {hero_section.pledge_card.title}
                </h3>

                <div className="space-y-6 relative z-10">
                  {hero_section.pledge_card.items.map((item, idx) => {
                    const ItemIcon = IconMap[item.icon] || Shield;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-4 group/item"
                      >
                        <div className="mt-1 p-2.5 rounded-xl bg-emerald-900/50 text-emerald-400 shrink-0 border border-emerald-500/20 group-hover/item:bg-emerald-500/20 group-hover/item:text-emerald-300 transition-colors">
                          <ItemIcon size={18} />
                        </div>
                        <p className="text-gray-300 text-sm sm:text-base font-medium pt-2 group-hover/item:text-gray-200 transition-colors">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gray-600 border-2 border-[#0F2922] shadow-lg relative z-0 hover:z-10 hover:scale-110 transition-transform duration-300"
                      />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-[#0F2922] flex items-center justify-center text-[10px] font-bold shadow-lg relative z-0 hover:z-10 hover:scale-110 transition-transform duration-300">
                      +42
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/20">
                    {hero_section.pledge_card.active_members_text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cards (Overlapping) */}
        <div className="absolute bottom-0 left-0 w-full translate-y-1/2 z-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {hero_section.floating_cards.map((card, idx) => {
                const CardIcon = IconMap[card.icon];
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-start gap-5 h-full transform transition-all duration-300 hover:-translate-y-2 group"
                  >
                    <div
                      className={`p-4 rounded-2xl transition-colors duration-300 ${
                        idx === 0
                          ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                          : idx === 1
                            ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                            : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      }`}
                    >
                      <CardIcon size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-3 font-serif">
                        {card.title}
                      </h4>
                      <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-600">
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
      <section className="pt-56 pb-24 bg-slate-50 relative overflow-hidden">
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-emerald-700 text-xs font-bold mb-6 shadow-sm uppercase tracking-wider">
              <Rocket size={14} />
              {goals_section.badge}
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif text-slate-900 mb-6 leading-tight">
              {goals_section.title}
            </h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
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
                  className="bg-white rounded-[2rem] p-8 border border-transparent hover:border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-slate-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <CardIcon size={28} />
                    </div>
                    <span className="text-slate-200 text-4xl font-black opacity-20 group-hover:opacity-10 group-hover:text-emerald-900 transition-all font-serif">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm group-hover:text-gray-600">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- WORK PROCESS SECTION --- */}
      {content.about_page?.work_process && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-7xl mx-auto">
              {/* Green background shape offset */}
              <div className="absolute top-4 left-4 right-[-10px] bottom-[-10px] bg-emerald-800 rounded-[2.5rem] z-0"></div>

              {/* Main White Card */}
              <div className="relative bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl z-10 overflow-hidden border border-gray-100">
                {/* Background Watermark Icon */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 text-gray-50 opacity-40 mix-blend-multiply pointer-events-none translate-x-1/4">
                  <svg
                    width="600"
                    height="600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4" />
                    <path d="m16.2 7.8 2.9-2.9" />
                    <path d="M18 12h4" />
                    <path d="m16.2 16.2 2.9 2.9" />
                    <path d="M12 18v4" />
                    <path d="m4.9 19.1 2.9-2.9" />
                    <path d="M2 12h4" />
                    <path d="m4.9 4.9 2.9 2.9" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-900 mb-6">
                      {content.about_page.work_process.title}
                    </h2>
                    <p className="text-slate-500 max-w-2xl text-lg">
                      {content.about_page.work_process.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[28px] left-0 w-[80%] h-[2px] bg-gradient-to-r from-emerald-200 via-emerald-100 to-transparent -z-10"></div>

                    {content.about_page.work_process.steps.map((step, idx) => (
                      <div key={idx} className="relative group">
                        <div className="w-14 h-14 rounded-full bg-white border-4 border-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-sm mb-6 group-hover:scale-110 group-hover:border-emerald-100 group-hover:shadow-md transition-all duration-300">
                          {idx + 1}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed border-l-2 border-transparent pl-0 group-hover:border-emerald-200 group-hover:pl-3 transition-all duration-300">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
