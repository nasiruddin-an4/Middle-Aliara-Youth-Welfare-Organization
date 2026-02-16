"use client";
import Link from "next/link";
import { Users, ArrowRight, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const IconMap = {
  users: Users,
  "arrow-right": ArrowRight,
  globe: Globe,
};

export default function Hero() {
  const { content } = useLanguage();
  const { tag, title, description, buttons } = content.hero;

  return (
    <section className="relative bg-slate-900 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/heroBg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-slate-900/80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">
        {/* Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-secondary text-sm font-medium mb-8 backdrop-blur-sm">
          <Globe size={16} />
          <span>{tag}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
          {title.prefix} <br className="hidden md:block" />
          <span className="text-secondary">{title.suffix}</span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed mb-10">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full">
          <Link
            href={buttons.primary.href}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-lg bg-primary hover:bg-[#008a50] text-white font-semibold transition-all shadow-lg shadow-green-900/20"
          >
            {buttons.primary.text}
            {IconMap[buttons.primary.icon] &&
              (() => {
                const Icon = IconMap[buttons.primary.icon];
                return <Icon size={20} />;
              })()}
          </Link>

          <Link
            href={buttons.secondary.href}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-lg bg-white/5 hover:bg-secondary border border-white/10 text-white font-semibold transition-all backdrop-blur-sm"
          >
            {buttons.secondary.text}
            {IconMap[buttons.secondary.icon] &&
              (() => {
                const Icon = IconMap[buttons.secondary.icon];
                return <Icon size={20} />;
              })()}
          </Link>
        </div>
      </div>
    </section>
  );
}
