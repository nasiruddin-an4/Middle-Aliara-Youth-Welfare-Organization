"use client";
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Copy, Landmark, Smartphone, HeartHandshake } from "lucide-react";
import Swal from "sweetalert2";

export default function DonatePage() {
  const { content } = useLanguage();

  // Guard clause to prevent errors if content isn't fully loaded or key is missing
  if (!content || !content.donate_page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { hero, methods, contact } = content.donate_page;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: `${text} copied to clipboard`,
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: "top-end",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-emerald-700 to-teal-900 opacity-90"></div>
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <HeartHandshake className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
            {hero.title}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-emerald-50 leading-relaxed font-light">
            {hero.description}
          </p>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="relative -mt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {methods.title}
              </h2>
              <p className="text-slate-600">{methods.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Bkash */}
              <div className="group relative bg-pink-50/50 border border-pink-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {methods.bkash.title}
                </h3>
                <div className="flex items-center justify-between bg-white border border-pink-200 rounded-lg p-3 mt-4 group-hover:border-pink-300 transition-colors">
                  <span className="font-mono text-lg font-semibold text-gray-700 tracking-wide">
                    {methods.bkash.number}
                  </span>
                  <button
                    onClick={() => handleCopy(methods.bkash.number)}
                    className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-all"
                    title="Copy Number"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Nagad */}
              <div className="group relative bg-orange-50/50 border border-orange-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {methods.nagad.title}
                </h3>
                <div className="flex items-center justify-between bg-white border border-orange-200 rounded-lg p-3 mt-4 group-hover:border-orange-300 transition-colors">
                  <span className="font-mono text-lg font-semibold text-gray-700 tracking-wide">
                    {methods.nagad.number}
                  </span>
                  <button
                    onClick={() => handleCopy(methods.nagad.number)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all"
                    title="Copy Number"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Footer in Card */}
            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
              <p className="text-slate-500 mb-2">{contact.title}</p>
              <a
                href={`tel:${contact.phone}`}
                className="text-xl font-bold text-primary hover:text-emerald-700 transition"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
