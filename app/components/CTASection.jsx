"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CTASection() {
  const { content } = useLanguage();
  const { title, description, buttons } = content.cta;

  return (
    <section className="py-24 max-w-7xl mx-auto overflow-hidden">
      <div className="relative bg-green-900 rounded-2xl px-20 py-16 z-10 w-full mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-green-50 mb-10 w-full mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={buttons.primary.href}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-lg bg-secondary text-white font-bold hover:bg-slate-800 transition-all"
          >
            {buttons.primary.text}
            <ArrowRight size={20} />
          </Link>
          <Link
            href={buttons.secondary.href}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 border border-white/20 transition-all"
          >
            {buttons.secondary.text}
          </Link>
        </div>
      </div>
    </section>
  );
}
