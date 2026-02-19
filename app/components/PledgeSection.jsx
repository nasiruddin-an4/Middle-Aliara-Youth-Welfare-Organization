"use client";
import { Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function PledgeSection() {
  const { content } = useLanguage();
  const { tag, title, description, features } = content.pledge;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Side - Image Placeholder (You can replace this with a real image later) */}
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-secondary/10 rounded-2xl transform rotate-3"></div>
            <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {/* Placeholder for an image depicting unity or the village */}
                <img src="/10008.jpg" alt="" />
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="w-full lg:w-1/2">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              {tag}
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {description}
            </p>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <Check size={14} className="text-primary" />
                  </div>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
