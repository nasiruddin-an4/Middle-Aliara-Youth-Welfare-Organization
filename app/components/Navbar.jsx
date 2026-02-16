"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Shield, Heart } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { content, language, toggleLanguage } = useLanguage();
  const { logo, links, donate } = content.navbar;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <div className="flex justify-between h-20 items-center">
            {/* Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-3 group z-50 relative"
            >
              <div className="bg-primary text-white p-2 rounded-lg group-hover:scale-105 transition-transform duration-300">
                <Shield size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm md:text-base leading-tight group-hover:text-primary transition-colors duration-200">
                  {logo.text}
                </span>
                <span className="text-sm text-slate-700 font-medium pt-0.5">
                  {logo.subtext}
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1 lg:space-x-2">
              {links.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-gray-50 hover:text-primary"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Language Switcher */}
              <div
                onClick={toggleLanguage}
                className="cursor-pointer flex items-center border border-gray-200 rounded-lg p-1 gap-1 ml-4 bg-gray-50 hover:border-primary/30 transition-all"
              >
                <span
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${language === "en" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-primary"}`}
                >
                  EN
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${language === "bn" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-primary"}`}
                >
                  BN
                </span>
              </div>

              {/* Donate Button */}
              <Link
                href="/donate"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-[#008a50] text-white text-sm font-semibold transition-all ml-2 shadow-lg shadow-green-900/20"
              >
                <Heart size={16} className="fill-white" />
                {donate}
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Language Switcher Mobile */}

              {/* Donate Button Mobile (Icon only or small) */}
              <Link
                href="/donate"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary hover:bg-[#008a50] text-white transition-all shadow-md"
              >
                <Heart size={18} className="fill-white" />
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-500 hover:text-gray-700 p-2 focus:outline-none ml-1"
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-bold text-gray-900">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex flex-col p-4 space-y-2 overflow-y-auto flex-grow">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={index}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-gray-50 hover:text-primary"
                    }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-600">
                Language
              </span>
              <div
                onClick={toggleLanguage}
                className="cursor-pointer flex items-center border border-gray-200 rounded-lg p-1 gap-1 bg-gray-50"
              >
                <span
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${language === "en" ? "bg-primary text-white shadow-sm" : "text-slate-500"}`}
                >
                  EN
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${language === "bn" ? "bg-primary text-white shadow-sm" : "text-slate-500"}`}
                >
                  BN
                </span>
              </div>
            </div>
            <Link
              href="/donate"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg bg-primary hover:bg-[#008a50] text-white font-semibold transition-all shadow-lg shadow-green-900/20"
            >
              <Heart size={18} className="fill-white" />
              {donate}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
