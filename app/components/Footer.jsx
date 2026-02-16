"use client";
import { useLanguage } from "../context/LanguageContext";
import Link from "next/link";
import { Facebook, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  const { content } = useLanguage();
  const { organization, copyright, description, sections } = content.footer;

  return (
    <footer className="relative bg-[#0b3321] text-white pt-42 pb-8 overflow-hidden text-sm">
      {/* Background Image / Shape */}
      <div
        className="absolute inset-0 z-0 opacity-80 pointer-events-none"
        style={{
          backgroundImage: "url('/10001.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Dark Overlay (optional, adjusted opacity) - Removed if image is the "shape" intended to show clearly */}
      {/* or keep it very subtle if needed. The user wants the shape to show, so let's rely on opacity of the image itself against the dark green bg */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          {/* Column 1: Organization Info & Socials */}
          <div className="flex flex-col gap-6">
            {/* Logo Placeholder - You might want to replace text with actual logo image later */}
            <div className="bg-white/10 w-fit p-3 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="font-bold text-xl text-yellow-500">
                {/* Placeholder for Logo Image if available, currently using Initials/Text */}
                LogoPlace
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed text-xs md:text-sm">
              {description}
            </p>

            <div className="flex gap-4 mt-2">
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-red-600 hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                <Youtube size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Dynamic Columns */}
          {sections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <h3 className="font-bold text-lg text-white border-b border-white/10 pb-2 w-fit pr-8">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {organization} - {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
